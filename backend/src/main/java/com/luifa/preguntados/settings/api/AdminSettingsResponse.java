package com.luifa.preguntados.settings.api;

import com.luifa.preguntados.settings.domain.AppSettings;
import java.time.Instant;

public record AdminSettingsResponse(
        int totalRounds,
        int requiredCorrect,
        int questionSeconds,
        int stockHats,
        int stockCups,
        Instant updatedAt) {

    public static AdminSettingsResponse from(AppSettings settings) {
        return new AdminSettingsResponse(
                settings.getTotalRounds(),
                settings.getRequiredCorrect(),
                settings.getQuestionSeconds(),
                settings.getStockHats(),
                settings.getStockCups(),
                settings.getUpdatedAt());
    }
}
