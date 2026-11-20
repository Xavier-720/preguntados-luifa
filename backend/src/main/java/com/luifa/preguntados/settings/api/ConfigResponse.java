package com.luifa.preguntados.settings.api;

import com.luifa.preguntados.catalog.api.CategorySummary;
import java.util.List;

public record ConfigResponse(
        int totalRounds,
        int requiredCorrect,
        int questionSeconds,
        int stockHats,
        int stockCups,
        List<CategorySummary> categories) {
}
