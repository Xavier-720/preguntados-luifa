package com.luifa.preguntados.seed;

import com.luifa.preguntados.catalog.domain.Category;
import com.luifa.preguntados.catalog.domain.Question;
import com.luifa.preguntados.catalog.repo.CategoryRepository;
import com.luifa.preguntados.catalog.repo.QuestionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuestionBankSeeder {

    private static final Logger log = LoggerFactory.getLogger(QuestionBankSeeder.class);

    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;

    public QuestionBankSeeder(CategoryRepository categoryRepository, QuestionRepository questionRepository) {
        this.categoryRepository = categoryRepository;
        this.questionRepository = questionRepository;
    }

    @Transactional
    public void seedIfEmpty() {
        if (categoryRepository.count() > 0) {
            log.info("El banco de preguntas ya existe; no se vuelve a cargar.");
            return;
        }

        int categoryCount = 0;
        int questionCount = 0;
        for (QuestionBank.CategorySeed categorySeed : QuestionBank.all()) {
            Category category = categoryRepository.save(
                    new Category(categorySeed.name(), categorySeed.color(), categoryCount));

            for (QuestionBank.QuestionSeed questionSeed : categorySeed.questions()) {
                if (!questionSeed.options().contains(questionSeed.answer())) {
                    throw new IllegalStateException(
                            "La respuesta '%s' no está entre las opciones de: %s"
                                    .formatted(questionSeed.answer(), questionSeed.prompt()));
                }

                Question question = new Question(category, questionSeed.prompt(), questionSeed.fact());
                for (String option : questionSeed.options()) {
                    question.addOption(option, option.equals(questionSeed.answer()));
                }
                if (question.correctOptionCount() != 1) {
                    throw new IllegalStateException(
                            "La pregunta debe tener exactamente una respuesta correcta: " + questionSeed.prompt());
                }

                questionRepository.save(question);
                questionCount++;
            }
            categoryCount++;
        }

        log.info("Se cargaron {} categorías y {} preguntas.", categoryCount, questionCount);
    }
}
