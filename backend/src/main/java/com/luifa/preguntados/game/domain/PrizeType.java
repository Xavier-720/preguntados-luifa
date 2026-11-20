package com.luifa.preguntados.game.domain;

public enum PrizeType {
    HAT("Gorra"),
    CUP("Vaso");

    private final String label;

    PrizeType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
