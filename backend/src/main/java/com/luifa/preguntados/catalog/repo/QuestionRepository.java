package com.luifa.preguntados.catalog.repo;

import com.luifa.preguntados.catalog.domain.Question;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    @EntityGraph(attributePaths = {"options", "category"})
    @Query("select distinct q from Question q where q.category.id = :categoryId and q.active = true")
    List<Question> findActiveByCategoryId(@Param("categoryId") Long categoryId);

    @Query("""
            select q.category.id as categoryId, count(q) as total
            from Question q
            where q.active = true
            group by q.category.id
            """)
    List<CategoryQuestionCount> countActiveByCategory();

    interface CategoryQuestionCount {
        Long getCategoryId();

        long getTotal();
    }
}
