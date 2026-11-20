package com.luifa.preguntados.catalog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String name;

    @Column(nullable = false, length = 20)
    private String color;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    protected Category() {
    }

    public Category(String name, String color, int displayOrder) {
        this.name = name;
        this.color = color;
        this.displayOrder = displayOrder;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getColor() {
        return color;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }
}
