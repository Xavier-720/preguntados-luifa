package com.luifa.preguntados.game.api;

import com.luifa.preguntados.catalog.api.CategorySummary;
import java.util.List;
import java.util.UUID;

public record StartGameResponse(
        UUID gameId,
        int totalRounds,
        int requiredCorrect,
        int questionSeconds,
        List<CategorySummary> categories,
        int stockHats,
        int stockCups) {
}
