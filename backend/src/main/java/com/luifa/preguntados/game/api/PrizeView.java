package com.luifa.preguntados.game.api;

import com.luifa.preguntados.game.domain.PrizeType;

public record PrizeView(String code, String label) {

    public static PrizeView from(PrizeType prize) {
        if (prize == null) {
            return null;
        }
        return new PrizeView(prize.name(), prize.getLabel());
    }
}
