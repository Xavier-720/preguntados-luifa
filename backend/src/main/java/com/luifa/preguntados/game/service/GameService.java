package com.luifa.preguntados.game.service;

import com.luifa.preguntados.catalog.api.CategorySummary;
import com.luifa.preguntados.catalog.domain.Category;
import com.luifa.preguntados.catalog.domain.Question;
import com.luifa.preguntados.catalog.domain.QuestionOption;
import com.luifa.preguntados.catalog.repo.CategoryRepository;
import com.luifa.preguntados.catalog.repo.QuestionRepository;
import com.luifa.preguntados.catalog.service.CatalogService;
import com.luifa.preguntados.common.ApiErrorCode;
import com.luifa.preguntados.common.ApiException;
import com.luifa.preguntados.game.api.AnswerResponse;
import com.luifa.preguntados.game.api.CategoryView;
import com.luifa.preguntados.game.api.FinishResponse;
import com.luifa.preguntados.game.api.OptionView;
import com.luifa.preguntados.game.api.PrizeResponse;
import com.luifa.preguntados.game.api.PrizeView;
import com.luifa.preguntados.game.api.QuestionView;
import com.luifa.preguntados.game.api.RoundResponse;
import com.luifa.preguntados.game.api.StartGameResponse;
import com.luifa.preguntados.game.domain.GameRound;
import com.luifa.preguntados.game.domain.GameSession;
import com.luifa.preguntados.game.domain.GameStatus;
import com.luifa.preguntados.game.domain.PrizeType;
import com.luifa.preguntados.game.repo.GameRoundRepository;
import com.luifa.preguntados.game.repo.GameSessionRepository;
import com.luifa.preguntados.settings.domain.AppSettings;
import com.luifa.preguntados.settings.repo.AppSettingsRepository;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GameService {

    private static final int SETTINGS_ID = 1;
    // Margen para que una respuesta enviada justo al vencer no se pierda por latencia.
    private static final Duration ANSWER_GRACE = Duration.ofSeconds(2);

    private final GameSessionRepository sessionRepository;
    private final GameRoundRepository roundRepository;
    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;
    private final AppSettingsRepository settingsRepository;
    private final CatalogService catalogService;
    private final PrizeDrawer prizeDrawer;
    private final Clock clock;
    private final Random random;

    public GameService(GameSessionRepository sessionRepository,
                       GameRoundRepository roundRepository,
                       CategoryRepository categoryRepository,
                       QuestionRepository questionRepository,
                       AppSettingsRepository settingsRepository,
                       CatalogService catalogService,
                       PrizeDrawer prizeDrawer,
                       Clock clock,
                       Random random) {
        this.sessionRepository = sessionRepository;
        this.roundRepository = roundRepository;
        this.categoryRepository = categoryRepository;
        this.questionRepository = questionRepository;
        this.settingsRepository = settingsRepository;
        this.catalogService = catalogService;
        this.prizeDrawer = prizeDrawer;
        this.clock = clock;
        this.random = random;
    }

    @Transactional
    public StartGameResponse startGame() {
        AppSettings settings = settings();
        List<CategorySummary> categories = catalogService.playableCategories();
        if (categories.isEmpty()) {
            throw noQuestions();
        }

        // La sesión guarda una foto de las reglas; si cambian, la partida en curso no se altera.
        GameSession session = new GameSession(
                UUID.randomUUID(),
                settings.getTotalRounds(),
                settings.getRequiredCorrect(),
                settings.getQuestionSeconds(),
                Instant.now(clock));
        sessionRepository.save(session);

        return new StartGameResponse(
                session.getId(),
                session.getTotalRounds(),
                session.getRequiredCorrect(),
                session.getQuestionSeconds(),
                categories,
                settings.getStockHats(),
                settings.getStockCups());
    }

    @Transactional
    public RoundResponse spin(UUID gameId) {
        GameSession session = lockSession(gameId);
        if (session.getStatus() == GameStatus.FINISHED) {
            throw gameFinished();
        }
        if (session.isComplete()) {
            throw gameComplete();
        }

        Optional<GameRound> pendingRound =
                roundRepository.findFirstByGameSessionIdAndAnsweredFalseOrderByRoundNumberAsc(gameId);
        // Si quedó una ronda sin responder, la devolvemos tal cual para no crear otra.
        if (pendingRound.isPresent()) {
            return toRoundResponse(pendingRound.get(), session);
        }

        // La categoría y la pregunta las elige siempre el servidor.
        List<Category> categories = categoryRepository.findAllWithActiveQuestions();
        if (categories.isEmpty()) {
            throw noQuestions();
        }
        Category category = categories.get(random.nextInt(categories.size()));

        List<Question> questions = questionRepository.findActiveByCategoryId(category.getId());
        if (questions.isEmpty()) {
            throw noQuestions();
        }

        Set<Long> usedQuestionIds = new HashSet<>(roundRepository.findQuestionIdsByGameSessionId(gameId));
        // Evitamos repetir preguntas dentro de la misma partida; si no alcanzan, se permite repetir.
        List<Question> availableQuestions = questions.stream()
                .filter(question -> !usedQuestionIds.contains(question.getId()))
                .toList();
        if (availableQuestions.isEmpty()) {
            availableQuestions = questions;
        }
        Question question = availableQuestions.get(random.nextInt(availableQuestions.size()));

        GameRound round = new GameRound(
                UUID.randomUUID(),
                session,
                session.getRoundsPlayed() + 1,
                category,
                question,
                Instant.now(clock));
        roundRepository.save(round);

        return toRoundResponse(round, session);
    }

    @Transactional
    public AnswerResponse answer(UUID gameId, UUID roundId, Long optionId) {
        GameSession session = lockSession(gameId);
        GameRound round = roundRepository.findByIdAndGameSessionId(roundId, gameId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        ApiErrorCode.ROUND_NOT_FOUND,
                        "No encontramos la ronda indicada."));

        // Responder dos veces devuelve lo mismo y no vuelve a sumar aciertos.
        if (round.isAnswered()) {
            return toAnswerResponse(round, session);
        }
        if (session.getStatus() == GameStatus.FINISHED) {
            throw gameFinished();
        }

        Instant now = Instant.now(clock);
        // Sin respuesta, o fuera del margen de gracia, la ronda cuenta como timeout.
        boolean timedOut = optionId == null
                || round.isExpired(session.getQuestionSeconds(), now, ANSWER_GRACE);

        QuestionOption selectedOption = null;
        boolean correct = false;
        if (!timedOut) {
            selectedOption = round.getQuestion().getOptions().stream()
                    .filter(option -> option.getId().equals(optionId))
                    .findFirst()
                    .orElseThrow(() -> new ApiException(
                            HttpStatus.BAD_REQUEST,
                            ApiErrorCode.INVALID_OPTION,
                            "La opción elegida no pertenece a esta pregunta."));
            correct = selectedOption.isCorrect();
        }

        round.answer(selectedOption, correct, timedOut, now);
        session.recordAnswer(correct);

        return toAnswerResponse(round, session);
    }

    @Transactional
    public FinishResponse finish(UUID gameId) {
        GameSession session = lockSession(gameId);
        // Solo se cierra cuando todas las rondas tienen respuesta.
        if (session.getStatus() == GameStatus.IN_PROGRESS) {
            if (!session.isComplete()) {
                throw new ApiException(
                        HttpStatus.CONFLICT,
                        ApiErrorCode.GAME_NOT_FINISHED,
                        "Todavía quedan preguntas por responder.");
            }
            session.finish(Instant.now(clock));
        }

        AppSettings settings = settings();
        boolean won = session.isWon();
        boolean prizeAvailable = won && session.getPrize() == null && settings.hasStock();

        return new FinishResponse(
                session.getId(),
                session.getCorrectAnswers(),
                session.getTotalRounds(),
                session.getRequiredCorrect(),
                won,
                prizeAvailable,
                PrizeView.from(session.getPrize()),
                settings.getStockHats(),
                settings.getStockCups());
    }

    @Transactional
    public PrizeResponse drawPrize(UUID gameId) {
        GameSession session = lockSession(gameId);

        // Reintentar el sorteo devuelve el mismo premio sin volver a descontar stock.
        if (session.getPrize() != null) {
            AppSettings current = settings();
            return new PrizeResponse(
                    PrizeView.from(session.getPrize()),
                    current.getStockHats(),
                    current.getStockCups());
        }
        if (session.getStatus() != GameStatus.FINISHED) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    ApiErrorCode.GAME_NOT_FINISHED,
                    "Primero terminá la partida para sortear el premio.");
        }
        if (!session.isWon()) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    ApiErrorCode.GAME_NOT_WON,
                    "La partida no tiene los aciertos necesarios para el premio.");
        }

        // La fila de configuración también se bloquea: dos sorteos no pueden descontar la misma unidad.
        AppSettings settings = settingsForUpdate();
        if (!settings.hasStock()) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    ApiErrorCode.OUT_OF_STOCK,
                    "No quedan premios en stock.");
        }

        Instant now = Instant.now(clock);
        PrizeType prize = prizeDrawer.draw(settings.getStockHats(), settings.getStockCups());
        settings.decrement(prize, now);
        session.awardPrize(prize, now);

        return new PrizeResponse(
                PrizeView.from(prize),
                settings.getStockHats(),
                settings.getStockCups());
    }

    private RoundResponse toRoundResponse(GameRound round, GameSession session) {
        // Mezclamos las opciones para que el orden no delate la respuesta correcta.
        List<QuestionOption> options = new ArrayList<>(round.getQuestion().getOptions());
        Collections.shuffle(options, random);
        List<OptionView> optionViews = options.stream()
                .map(option -> new OptionView(option.getId(), option.getLabel()))
                .toList();

        return new RoundResponse(
                round.getId(),
                round.getRoundNumber(),
                session.getTotalRounds(),
                CategoryView.from(round.getCategory()),
                new QuestionView(
                        round.getQuestion().getId(),
                        round.getQuestion().getPrompt(),
                        optionViews),
                round.getStartedAt().plusSeconds(session.getQuestionSeconds()));
    }

    private AnswerResponse toAnswerResponse(GameRound round, GameSession session) {
        QuestionOption correctOption = round.getQuestion().correctOption();
        Long selectedOptionId = round.getSelectedOption() == null
                ? null
                : round.getSelectedOption().getId();

        return new AnswerResponse(
                round.getId(),
                round.isCorrect(),
                round.isTimedOut(),
                selectedOptionId,
                correctOption.getId(),
                correctOption.getLabel(),
                round.getQuestion().getFact(),
                session.getCorrectAnswers(),
                session.getRoundsPlayed(),
                session.getTotalRounds(),
                session.getRoundsPlayed() >= session.getTotalRounds());
    }

    private GameSession lockSession(UUID gameId) {
        // Bloqueo pesimista: evita respuestas o sorteos simultáneos sobre la misma partida.
        return sessionRepository.findByIdForUpdate(gameId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        ApiErrorCode.GAME_NOT_FOUND,
                        "No encontramos la partida indicada."));
    }

    private AppSettings settings() {
        return settingsRepository.findById(SETTINGS_ID).orElseThrow(this::settingsNotFound);
    }

    private AppSettings settingsForUpdate() {
        return settingsRepository.findForUpdate().orElseThrow(this::settingsNotFound);
    }

    private ApiException settingsNotFound() {
        return new ApiException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ApiErrorCode.SETTINGS_NOT_FOUND,
                "No se encontró la configuración del juego.");
    }

    private ApiException gameFinished() {
        return new ApiException(
                HttpStatus.CONFLICT,
                ApiErrorCode.GAME_ALREADY_FINISHED,
                "La partida ya está finalizada.");
    }

    private ApiException gameComplete() {
        return new ApiException(
                HttpStatus.CONFLICT,
                ApiErrorCode.GAME_COMPLETE,
                "La partida ya tiene todas las respuestas; finalizala para ver el resultado.");
    }

    private ApiException noQuestions() {
        return new ApiException(
                HttpStatus.CONFLICT,
                ApiErrorCode.NO_QUESTIONS,
                "No hay preguntas cargadas para jugar.");
    }
}
