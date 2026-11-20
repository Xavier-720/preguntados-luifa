package com.luifa.preguntados.settings.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateSettingsRequest(
        @NotNull(message = "Las rondas son obligatorias")
        @Min(value = 1, message = "Mínimo 1 ronda")
        @Max(value = 5, message = "Máximo 5 rondas")
        Integer totalRounds,

        @NotNull(message = "Los aciertos necesarios son obligatorios")
        @Min(value = 1, message = "Mínimo 1 acierto")
        @Max(value = 5, message = "Máximo 5 aciertos")
        Integer requiredCorrect,

        @NotNull(message = "Los segundos por pregunta son obligatorios")
        @Min(value = 5, message = "Mínimo 5 segundos")
        @Max(value = 60, message = "Máximo 60 segundos")
        Integer questionSeconds,

        @NotNull(message = "El stock de gorras es obligatorio")
        @Min(value = 0, message = "El stock no puede ser negativo")
        @Max(value = 999, message = "Máximo 999 gorras")
        Integer stockHats,

        @NotNull(message = "El stock de vasos es obligatorio")
        @Min(value = 0, message = "El stock no puede ser negativo")
        @Max(value = 999, message = "Máximo 999 vasos")
        Integer stockCups) {
}
