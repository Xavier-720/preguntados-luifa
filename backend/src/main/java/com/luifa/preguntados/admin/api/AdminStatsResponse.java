package com.luifa.preguntados.admin.api;

import com.luifa.preguntados.catalog.api.CategorySummary;
import java.util.List;

public record AdminStatsResponse(
        long totalGames,
        long gamesToday,
        long totalWins,
        long winsToday,
        long totalPrizes,
        long prizesToday,
        int stockHats,
        int stockCups,
        List<CategorySummary> categories) {
}
