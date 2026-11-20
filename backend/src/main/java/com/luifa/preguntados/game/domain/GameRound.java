package com.luifa.preguntados.game.domain;

import com.luifa.preguntados.catalog.domain.Category;
import com.luifa.preguntados.catalog.domain.Question;
import com.luifa.preguntados.catalog.domain.QuestionOption;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "game_rounds",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_rounds_session_number",
                columnNames = {"game_session_id", "round_number"}))
public class GameRound {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_session_id", nullable = false)
    private GameSession gameSession;

    @Column(name = "round_number", nullable = false)
    private int roundNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false)
    private boolean answered;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id")
    private QuestionOption selectedOption;

    @Column(name = "correct")
    private Boolean correct;

    @Column(name = "timed_out", nullable = false)
    private boolean timedOut;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "answered_at")
    private Instant answeredAt;

    protected GameRound() {
    }

    public GameRound(UUID id, GameSession gameSession, int roundNumber, Category category, Question question,
                     Instant startedAt) {
        this.id = id;
        this.gameSession = gameSession;
        this.roundNumber = roundNumber;
        this.category = category;
        this.question = question;
        this.startedAt = startedAt;
    }

    public void answer(QuestionOption selectedOption, boolean correct, boolean timedOut, Instant answeredAt) {
        this.selectedOption = selectedOption;
        this.correct = correct;
        this.timedOut = timedOut;
        this.answered = true;
        this.answeredAt = answeredAt;
    }

    public boolean isExpired(int seconds, Instant now, Duration grace) {
        return now.isAfter(startedAt.plusSeconds(seconds).plus(grace));
    }

    public boolean isCorrect() {
        return Boolean.TRUE.equals(correct);
    }

    public UUID getId() {
        return id;
    }

    public GameSession getGameSession() {
        return gameSession;
    }

    public int getRoundNumber() {
        return roundNumber;
    }

    public Category getCategory() {
        return category;
    }

    public Question getQuestion() {
        return question;
    }

    public boolean isAnswered() {
        return answered;
    }

    public QuestionOption getSelectedOption() {
        return selectedOption;
    }

    public boolean isTimedOut() {
        return timedOut;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getAnsweredAt() {
        return answeredAt;
    }
}
