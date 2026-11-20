package com.luifa.preguntados.game.api;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AnswerRequest(
        @NotNull(message = "La ronda es obligatoria")
        UUID roundId,

        Long optionId) {
}
