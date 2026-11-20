package com.luifa.preguntados.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import java.time.Clock;
import java.util.Random;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    public Random random() {
        return new Random();
    }

    @Bean
    public OpenAPI preguntadosOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Preguntados Luifa API")
                .version("1.0.0")
                .description("API del juego de preguntas y sorteos de Las Camisetas de Luifa."));
    }
}
