package com.luifa.preguntados.game.api;

import com.luifa.preguntados.catalog.domain.Category;

public record CategoryView(Long id, String name, String color) {

    public static CategoryView from(Category category) {
        return new CategoryView(category.getId(), category.getName(), category.getColor());
    }
}
