package com.luifa.preguntados.game.api;

import java.util.UUID;

public record FinishResponse(
        UUID gameId,
        int correctAnswers,
        int totalRounds,
        int requiredCorrect,
        boolean won,
        boolean prizeAvailable,
        PrizeView prize,
        int stockHats,
        int stockCups) {
}
