package com.luifa.preguntados.catalog.service;

import com.luifa.preguntados.catalog.api.CategorySummary;
import com.luifa.preguntados.catalog.domain.Category;
import com.luifa.preguntados.catalog.repo.CategoryRepository;
import com.luifa.preguntados.catalog.repo.QuestionRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService {

    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;

    public CatalogService(CategoryRepository categoryRepository, QuestionRepository questionRepository) {
        this.categoryRepository = categoryRepository;
        this.questionRepository = questionRepository;
    }

    @Transactional(readOnly = true)
    public List<CategorySummary> playableCategories() {
        Map<Long, Long> counts = activeQuestionCounts();
        return categoryRepository.findAllWithActiveQuestions().stream()
                .map(category -> toSummary(category, counts))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategorySummary> allCategories() {
        Map<Long, Long> counts = activeQuestionCounts();
        return categoryRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(category -> toSummary(category, counts))
                .toList();
    }

    private Map<Long, Long> activeQuestionCounts() {
        return questionRepository.countActiveByCategory().stream()
                .collect(Collectors.toMap(
                        QuestionRepository.CategoryQuestionCount::getCategoryId,
                        QuestionRepository.CategoryQuestionCount::getTotal));
    }

    private CategorySummary toSummary(Category category, Map<Long, Long> counts) {
        return new CategorySummary(
                category.getId(),
                category.getName(),
                category.getColor(),
                counts.getOrDefault(category.getId(), 0L));
    }
}
