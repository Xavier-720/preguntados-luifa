package com.luifa.preguntados.game.repo;

import com.luifa.preguntados.game.domain.GameSession;
import com.luifa.preguntados.game.domain.GameStatus;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GameSessionRepository extends JpaRepository<GameSession, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from GameSession s where s.id = :id")
    Optional<GameSession> findByIdForUpdate(@Param("id") UUID id);

    long countByStartedAtGreaterThanEqual(Instant since);

    long countByPrizeIsNotNull();

    long countByPrizeIsNotNullAndPrizeAwardedAtGreaterThanEqual(Instant since);

    @Query("""
            select count(s) from GameSession s
            where s.status = :status and s.correctAnswers >= s.requiredCorrect
            """)
    long countWins(@Param("status") GameStatus status);

    @Query("""
            select count(s) from GameSession s
            where s.status = :status and s.correctAnswers >= s.requiredCorrect and s.startedAt >= :since
            """)
    long countWinsSince(@Param("status") GameStatus status, @Param("since") Instant since);
}
