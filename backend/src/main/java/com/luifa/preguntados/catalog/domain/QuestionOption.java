package com.luifa.preguntados.catalog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "question_options")
public class QuestionOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false, length = 200)
    private String label;

    @Column(nullable = false)
    private boolean correct;

    protected QuestionOption() {
    }

    public QuestionOption(Question question, String label, boolean correct) {
        this.question = question;
        this.label = label;
        this.correct = correct;
    }

    public Long getId() {
        return id;
    }

    public Question getQuestion() {
        return question;
    }

    public String getLabel() {
        return label;
    }

    public boolean isCorrect() {
        return correct;
    }
}
