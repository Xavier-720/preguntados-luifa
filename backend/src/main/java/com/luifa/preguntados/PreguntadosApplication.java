package com.luifa.preguntados;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PreguntadosApplication {

    public static void main(String[] args) {
        SpringApplication.run(PreguntadosApplication.class, args);
    }
}
