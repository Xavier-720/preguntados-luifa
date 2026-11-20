package com.luifa.preguntados.game.api;

import java.util.List;

public record QuestionView(Long id, String prompt, List<OptionView> options) {
}
