package com.luifa.preguntados.seed;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class SeedRunner implements ApplicationRunner {

    private final QuestionBankSeeder seeder;

    public SeedRunner(QuestionBankSeeder seeder) {
        this.seeder = seeder;
    }

    @Override
    public void run(ApplicationArguments args) {
        seeder.seedIfEmpty();
    }
}
