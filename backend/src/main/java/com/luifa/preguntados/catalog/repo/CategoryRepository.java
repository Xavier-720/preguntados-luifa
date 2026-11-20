package com.luifa.preguntados.catalog.repo;

import com.luifa.preguntados.catalog.domain.Category;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByOrderByDisplayOrderAsc();

    @Query("""
            select c from Category c
            where exists (
                select q.id from Question q
                where q.category = c and q.active = true
            )
            order by c.displayOrder
            """)
    List<Category> findAllWithActiveQuestions();
}
