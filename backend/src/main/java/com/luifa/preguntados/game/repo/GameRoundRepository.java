package com.luifa.preguntados.game.repo;

import com.luifa.preguntados.game.domain.GameRound;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GameRoundRepository extends JpaRepository<GameRound, UUID> {

    Optional<GameRound> findFirstByGameSessionIdAndAnsweredFalseOrderByRoundNumberAsc(UUID gameSessionId);

    Optional<GameRound> findByIdAndGameSessionId(UUID id, UUID gameSessionId);

    @Query("select r.question.id from GameRound r where r.gameSession.id = :gameSessionId")
    List<Long> findQuestionIdsByGameSessionId(@Param("gameSessionId") UUID gameSessionId);
}
