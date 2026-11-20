package com.luifa.preguntados;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.function.Executable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class GameFlowIntegrationTest {

    private static final String ADMIN_PIN = "test-pin";
    private static final ParameterizedTypeReference<Map<String, Object>> JSON =
            new ParameterizedTypeReference<>() {
            };

    @Value("${local.server.port}")
    private int port;

    @Autowired
    private JdbcTemplate jdbc;

    private RestClient client;

    @BeforeEach
    void setUp() {
        client = RestClient.builder().baseUrl("http://localhost:" + port).build();
        jdbc.update("delete from game_rounds");
        jdbc.update("delete from game_sessions");
        jdbc.update("""
                update app_settings
                set total_rounds = 3,
                    required_correct = 2,
                    question_seconds = 15,
                    stock_hats = 10,
                    stock_cups = 10,
                    updated_at = current_timestamp
                where id = 1
                """);
    }

    @Test
    void publicConfigExposesRulesAndCategories() {
        Map<String, Object> config = get("/api/v1/config", null);

        assertThat(number(config, "totalRounds")).isEqualTo(3);
        assertThat(number(config, "requiredCorrect")).isEqualTo(2);
        assertThat(number(config, "questionSeconds")).isEqualTo(15);
        assertThat(number(config, "stockHats")).isEqualTo(10);
        assertThat(number(config, "stockCups")).isEqualTo(10);

        List<Map<String, Object>> categories = list(config, "categories");
        assertThat(categories).hasSize(5);
        assertThat(categories.stream().mapToLong(category -> number(category, "questionCount")).sum())
                .isEqualTo(32);
    }

    @Test
    void spinningTwiceReturnsTheSamePendingRound() {
        String gameId = startGame();

        Map<String, Object> first = post("/api/v1/games/" + gameId + "/spins", null, null);
        Map<String, Object> second = post("/api/v1/games/" + gameId + "/spins", null, null);

        assertThat(second.get("roundId")).isEqualTo(first.get("roundId"));
    }

    @Test
    void winningGameAwardsPrizeAndDecrementsStock() {
        PlayedGame game = playGame(3);

        assertThat(game.finish().get("won")).isEqualTo(true);
        assertThat(game.finish().get("prizeAvailable")).isEqualTo(true);

        Map<String, Object> prize = post("/api/v1/games/" + game.id() + "/prize", null, null);
        Map<String, Object> prizeView = map(prize, "prize");
        assertThat(prizeView.get("code")).isIn("HAT", "CUP");
        assertThat(number(prize, "stockHats") + number(prize, "stockCups")).isEqualTo(19);

        Map<String, Object> config = get("/api/v1/config", null);
        assertThat(number(config, "stockHats") + number(config, "stockCups")).isEqualTo(19);
    }

    @Test
    void losingGameCannotDrawPrize() {
        PlayedGame game = playGame(1);

        assertThat(game.finish().get("won")).isEqualTo(false);
        assertThat(game.finish().get("prizeAvailable")).isEqualTo(false);

        RestClientResponseException error = expectError(
                409,
                () -> post("/api/v1/games/" + game.id() + "/prize", null, null));
        assertThat(error.getResponseBodyAsString()).contains("GAME_NOT_WON");
    }

    @Test
    void timeoutCountsAsWrongAndAnswerIsIdempotent() {
        String gameId = startGame();
        Map<String, Object> round = post("/api/v1/games/" + gameId + "/spins", null, null);
        String roundId = (String) round.get("roundId");
        long correctOptionId = correctOptionId(round);

        jdbc.update(
                "update game_rounds set started_at = dateadd('second', -120, current_timestamp) where id = ?",
                UUID.fromString(roundId));

        Map<String, Object> body = Map.of("roundId", roundId, "optionId", correctOptionId);
        Map<String, Object> first = post("/api/v1/games/" + gameId + "/answers", body, null);
        Map<String, Object> second = post("/api/v1/games/" + gameId + "/answers", body, null);

        assertThat(first.get("timedOut")).isEqualTo(true);
        assertThat(first.get("correct")).isEqualTo(false);
        assertThat(first.get("selectedOptionId")).isNull();
        assertThat(number(first, "roundsPlayed")).isEqualTo(1);
        assertThat(second.get("timedOut")).isEqualTo(true);
        assertThat(number(second, "roundsPlayed")).isEqualTo(1);
    }

    @Test
    void cannotFinishBeforeAnsweringEveryRound() {
        String gameId = startGame();

        RestClientResponseException error = expectError(
                409,
                () -> post("/api/v1/games/" + gameId + "/finish", null, null));
        assertThat(error.getResponseBodyAsString()).contains("GAME_NOT_FINISHED");
    }

    @Test
    void outOfStockDisablesPrize() {
        updateSettings(3, 2, 15, 0, 0);

        PlayedGame game = playGame(3);

        assertThat(game.finish().get("won")).isEqualTo(true);
        assertThat(game.finish().get("prizeAvailable")).isEqualTo(false);

        RestClientResponseException error = expectError(
                409,
                () -> post("/api/v1/games/" + game.id() + "/prize", null, null));
        assertThat(error.getResponseBodyAsString()).contains("OUT_OF_STOCK");
    }

    @Test
    void prizeDrawIsIdempotent() {
        PlayedGame game = playGame(3);

        Map<String, Object> first = post("/api/v1/games/" + game.id() + "/prize", null, null);
        Map<String, Object> second = post("/api/v1/games/" + game.id() + "/prize", null, null);

        assertThat(map(second, "prize").get("code")).isEqualTo(map(first, "prize").get("code"));
        assertThat(number(second, "stockHats") + number(second, "stockCups")).isEqualTo(19);
    }

    @Test
    void adminRequiresPinAndCanUpdateSettings() {
        expectError(401, () -> get("/api/v1/admin/settings", null));
        expectError(401, () -> get("/api/v1/admin/settings", "wrong-pin"));

        Map<String, Object> settings = get("/api/v1/admin/settings", ADMIN_PIN);
        assertThat(number(settings, "stockHats")).isEqualTo(10);

        Map<String, Object> updated = put(
                "/api/v1/admin/settings",
                Map.of(
                        "totalRounds", 4,
                        "requiredCorrect", 3,
                        "questionSeconds", 20,
                        "stockHats", 5,
                        "stockCups", 7),
                ADMIN_PIN);

        assertThat(number(updated, "totalRounds")).isEqualTo(4);
        assertThat(number(updated, "requiredCorrect")).isEqualTo(3);
        assertThat(number(updated, "questionSeconds")).isEqualTo(20);
        assertThat(number(updated, "stockHats")).isEqualTo(5);
        assertThat(number(updated, "stockCups")).isEqualTo(7);

        Map<String, Object> config = get("/api/v1/config", null);
        assertThat(number(config, "stockHats")).isEqualTo(5);
        assertThat(number(config, "stockCups")).isEqualTo(7);

        expectError(400, () -> put(
                "/api/v1/admin/settings",
                Map.of(
                        "totalRounds", 3,
                        "requiredCorrect", 4,
                        "questionSeconds", 20,
                        "stockHats", 5,
                        "stockCups", 7),
                ADMIN_PIN));
    }

    @Test
    void statsReflectGamesAndPrizes() {
        PlayedGame game = playGame(3);
        post("/api/v1/games/" + game.id() + "/prize", null, null);

        Map<String, Object> stats = get("/api/v1/admin/stats", ADMIN_PIN);

        assertThat(number(stats, "totalGames")).isEqualTo(1);
        assertThat(number(stats, "gamesToday")).isEqualTo(1);
        assertThat(number(stats, "totalWins")).isEqualTo(1);
        assertThat(number(stats, "winsToday")).isEqualTo(1);
        assertThat(number(stats, "totalPrizes")).isEqualTo(1);
        assertThat(number(stats, "prizesToday")).isEqualTo(1);
        assertThat(number(stats, "stockHats") + number(stats, "stockCups")).isEqualTo(19);
        assertThat(list(stats, "categories")).hasSize(5);
    }

    private PlayedGame playGame(int correctAnswers) {
        String gameId = startGame();
        for (int index = 0; index < 3; index++) {
            Map<String, Object> round = post("/api/v1/games/" + gameId + "/spins", null, null);
            long correctOptionId = correctOptionId(round);
            long chosenOptionId = index < correctAnswers
                    ? correctOptionId
                    : wrongOptionId(round, correctOptionId);

            Map<String, Object> answer = post(
                    "/api/v1/games/" + gameId + "/answers",
                    Map.of("roundId", round.get("roundId"), "optionId", chosenOptionId),
                    null);

            assertThat(answer.get("correct")).isEqualTo(index < correctAnswers);
        }

        Map<String, Object> finish = post("/api/v1/games/" + gameId + "/finish", null, null);
        return new PlayedGame(gameId, finish);
    }

    private String startGame() {
        Map<String, Object> game = post("/api/v1/games", null, null);
        return (String) game.get("gameId");
    }

    private long correctOptionId(Map<String, Object> round) {
        Map<String, Object> question = map(round, "question");
        long questionId = number(question, "id");
        Long id = jdbc.queryForObject(
                "select id from question_options where question_id = ? and correct = true",
                Long.class,
                questionId);
        if (id == null) {
            fail("La pregunta no tiene opción correcta");
        }
        return id;
    }

    private long wrongOptionId(Map<String, Object> round, long correctOptionId) {
        Map<String, Object> question = map(round, "question");
        return list(question, "options").stream()
                .mapToLong(option -> number(option, "id"))
                .filter(id -> id != correctOptionId)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No hay opción incorrecta"));
    }

    private void updateSettings(int totalRounds, int requiredCorrect, int questionSeconds, int stockHats,
                                int stockCups) {
        put(
                "/api/v1/admin/settings",
                Map.of(
                        "totalRounds", totalRounds,
                        "requiredCorrect", requiredCorrect,
                        "questionSeconds", questionSeconds,
                        "stockHats", stockHats,
                        "stockCups", stockCups),
                ADMIN_PIN);
    }

    private Map<String, Object> get(String path, String pin) {
        var spec = client.get().uri(path);
        if (pin != null) {
            spec = spec.header("X-Admin-Pin", pin);
        }
        return spec.retrieve().body(JSON);
    }

    private Map<String, Object> post(String path, Object body, String pin) {
        var spec = client.post().uri(path);
        if (pin != null) {
            spec = spec.header("X-Admin-Pin", pin);
        }
        if (body != null) {
            spec = spec.contentType(MediaType.APPLICATION_JSON).body(body);
        }
        return spec.retrieve().body(JSON);
    }

    private Map<String, Object> put(String path, Object body, String pin) {
        var spec = client.put().uri(path);
        if (pin != null) {
            spec = spec.header("X-Admin-Pin", pin);
        }
        return spec.contentType(MediaType.APPLICATION_JSON).body(body).retrieve().body(JSON);
    }

    private RestClientResponseException expectError(int status, Executable call) {
        try {
            call.execute();
            fail("Se esperaba un error HTTP " + status);
            return null;
        } catch (RestClientResponseException exception) {
            assertThat(exception.getStatusCode().value()).isEqualTo(status);
            return exception;
        } catch (Throwable throwable) {
            throw new AssertionError("Error inesperado ejecutando la llamada", throwable);
        }
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> map(Map<String, Object> source, String key) {
        return (Map<String, Object>) source.get(key);
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> list(Map<String, Object> source, String key) {
        return (List<Map<String, Object>>) source.get(key);
    }

    private static long number(Map<String, Object> source, String key) {
        return ((Number) source.get(key)).longValue();
    }

    private record PlayedGame(String id, Map<String, Object> finish) {
    }
}
