package com.luifa.preguntados.game.api;

import java.util.UUID;

public record AnswerResponse(
        UUID roundId,
        boolean correct,
        boolean timedOut,
        Long selectedOptionId,
        Long correctOptionId,
        String correctOptionLabel,
        String fact,
        int correctAnswers,
        int roundsPlayed,
        int totalRounds,
        boolean lastRound) {
}
