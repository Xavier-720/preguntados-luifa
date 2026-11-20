package com.luifa.preguntados.game.api;

import com.luifa.preguntados.game.service.GameService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/games")
@Tag(name = "Partidas", description = "Flujo completo de una partida")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Iniciar una partida")
    public StartGameResponse start() {
        return gameService.startGame();
    }

    @PostMapping("/{gameId}/spins")
    @Operation(summary = "Girar la ruleta y obtener una pregunta")
    public RoundResponse spin(@PathVariable UUID gameId) {
        return gameService.spin(gameId);
    }

    @PostMapping("/{gameId}/answers")
    @Operation(summary = "Responder una pregunta (optionId nulo = tiempo agotado)")
    public AnswerResponse answer(@PathVariable UUID gameId, @Valid @RequestBody AnswerRequest request) {
        return gameService.answer(gameId, request.roundId(), request.optionId());
    }

    @PostMapping("/{gameId}/finish")
    @Operation(summary = "Finalizar la partida y obtener el resumen")
    public FinishResponse finish(@PathVariable UUID gameId) {
        return gameService.finish(gameId);
    }

    @PostMapping("/{gameId}/prize")
    @Operation(summary = "Sortear el premio de una partida ganada")
    public PrizeResponse prize(@PathVariable UUID gameId) {
        return gameService.drawPrize(gameId);
    }
}
