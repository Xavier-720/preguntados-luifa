package com.luifa.preguntados.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(String adminPin, String timezone, Cors cors) {

    public AppProperties {
        if (adminPin == null || adminPin.isBlank()) {
            adminPin = "2468";
        }
        if (timezone == null || timezone.isBlank()) {
            timezone = "America/Argentina/Buenos_Aires";
        }
        if (cors == null || cors.allowedOrigins() == null || cors.allowedOrigins().isEmpty()) {
            cors = new Cors(List.of(
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:4173",
                    "http://127.0.0.1:4173"));
        }
    }

    public record Cors(List<String> allowedOrigins) {
    }
}
