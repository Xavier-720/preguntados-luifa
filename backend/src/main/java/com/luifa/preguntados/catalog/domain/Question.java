package com.luifa.preguntados.catalog.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 500)
    private String prompt;

    @Column(nullable = false, length = 500)
    private String fact;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuestionOption> options = new ArrayList<>();

    protected Question() {
    }

    public Question(Category category, String prompt, String fact) {
        this.category = category;
        this.prompt = prompt;
        this.fact = fact;
    }

    public void addOption(String label, boolean correct) {
        options.add(new QuestionOption(this, label, correct));
    }

    public QuestionOption correctOption() {
        return options.stream()
                .filter(QuestionOption::isCorrect)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("La pregunta %d no tiene una opción correcta".formatted(id)));
    }

    public long correctOptionCount() {
        return options.stream().filter(QuestionOption::isCorrect).count();
    }

    public Long getId() {
        return id;
    }

    public Category getCategory() {
        return category;
    }

    public String getPrompt() {
        return prompt;
    }

    public String getFact() {
        return fact;
    }

    public boolean isActive() {
        return active;
    }

    public List<QuestionOption> getOptions() {
        return options;
    }
}
