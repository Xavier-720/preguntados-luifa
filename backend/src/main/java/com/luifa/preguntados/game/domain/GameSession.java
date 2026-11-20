package com.luifa.preguntados.game.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "game_sessions")
public class GameSession {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GameStatus status;

    @Column(name = "total_rounds", nullable = false)
    private int totalRounds;

    @Column(name = "required_correct", nullable = false)
    private int requiredCorrect;

    @Column(name = "question_seconds", nullable = false)
    private int questionSeconds;

    @Column(name = "correct_answers", nullable = false)
    private int correctAnswers;

    @Column(name = "rounds_played", nullable = false)
    private int roundsPlayed;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PrizeType prize;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "finished_at")
    private Instant finishedAt;

    @Column(name = "prize_awarded_at")
    private Instant prizeAwardedAt;

    protected GameSession() {
    }

    public GameSession(UUID id, int totalRounds, int requiredCorrect, int questionSeconds, Instant startedAt) {
        this.id = id;
        this.status = GameStatus.IN_PROGRESS;
        this.totalRounds = totalRounds;
        this.requiredCorrect = requiredCorrect;
        this.questionSeconds = questionSeconds;
        this.startedAt = startedAt;
    }

    public void recordAnswer(boolean correct) {
        roundsPlayed++;
        if (correct) {
            correctAnswers++;
        }
    }

    public boolean isComplete() {
        return roundsPlayed >= totalRounds;
    }

    public boolean isWon() {
        return correctAnswers >= requiredCorrect;
    }

    public void finish(Instant now) {
        if (status == GameStatus.IN_PROGRESS) {
            status = GameStatus.FINISHED;
            finishedAt = now;
        }
    }

    public void awardPrize(PrizeType prize, Instant now) {
        this.prize = prize;
        this.prizeAwardedAt = now;
    }

    public UUID getId() {
        return id;
    }

    public GameStatus getStatus() {
        return status;
    }

    public int getTotalRounds() {
        return totalRounds;
    }

    public int getRequiredCorrect() {
        return requiredCorrect;
    }

    public int getQuestionSeconds() {
        return questionSeconds;
    }

    public int getCorrectAnswers() {
        return correctAnswers;
    }

    public int getRoundsPlayed() {
        return roundsPlayed;
    }

    public PrizeType getPrize() {
        return prize;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getFinishedAt() {
        return finishedAt;
    }

    public Instant getPrizeAwardedAt() {
        return prizeAwardedAt;
    }
}
