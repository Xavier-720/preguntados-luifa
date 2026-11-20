package com.luifa.preguntados.game.api;

import java.time.Instant;
import java.util.UUID;

public record RoundResponse(
        UUID roundId,
        int roundNumber,
        int totalRounds,
        CategoryView category,
        QuestionView question,
        Instant expiresAt) {
}
