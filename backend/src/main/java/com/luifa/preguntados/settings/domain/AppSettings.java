package com.luifa.preguntados.settings.domain;

import com.luifa.preguntados.game.domain.PrizeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "app_settings")
public class AppSettings {

    @Id
    private Integer id;

    @Column(name = "total_rounds", nullable = false)
    private int totalRounds;

    @Column(name = "required_correct", nullable = false)
    private int requiredCorrect;

    @Column(name = "question_seconds", nullable = false)
    private int questionSeconds;

    @Column(name = "stock_hats", nullable = false)
    private int stockHats;

    @Column(name = "stock_cups", nullable = false)
    private int stockCups;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AppSettings() {
    }

    public AppSettings(Integer id, int totalRounds, int requiredCorrect, int questionSeconds, int stockHats,
                       int stockCups, Instant updatedAt) {
        this.id = id;
        this.totalRounds = totalRounds;
        this.requiredCorrect = requiredCorrect;
        this.questionSeconds = questionSeconds;
        this.stockHats = stockHats;
        this.stockCups = stockCups;
        this.updatedAt = updatedAt;
    }

    public void update(int totalRounds, int requiredCorrect, int questionSeconds, int stockHats, int stockCups,
                       Instant updatedAt) {
        this.totalRounds = totalRounds;
        this.requiredCorrect = requiredCorrect;
        this.questionSeconds = questionSeconds;
        this.stockHats = stockHats;
        this.stockCups = stockCups;
        this.updatedAt = updatedAt;
    }

    public void decrement(PrizeType prize, Instant updatedAt) {
        if (prize == PrizeType.HAT) {
            if (stockHats <= 0) {
                throw new IllegalStateException("No quedan gorras en stock");
            }
            stockHats--;
        } else {
            if (stockCups <= 0) {
                throw new IllegalStateException("No quedan vasos en stock");
            }
            stockCups--;
        }
        this.updatedAt = updatedAt;
    }

    public boolean hasStock() {
        return stockHats + stockCups > 0;
    }

    public Integer getId() {
        return id;
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

    public int getStockHats() {
        return stockHats;
    }

    public int getStockCups() {
        return stockCups;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
