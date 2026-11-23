package com.luifa.preguntados.settings.service;

import com.luifa.preguntados.common.ApiErrorCode;
import com.luifa.preguntados.common.ApiException;
import com.luifa.preguntados.settings.domain.AppSettings;
import com.luifa.preguntados.settings.repo.AppSettingsRepository;
import java.time.Clock;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    private static final int SETTINGS_ID = 1;

    private final AppSettingsRepository repository;
    private final Clock clock;

    public SettingsService(AppSettingsRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public AppSettings get() {
        return repository.findById(SETTINGS_ID).orElseThrow(this::settingsNotFound);
    }

    @Transactional
    public AppSettings update(int totalRounds, int requiredCorrect, int questionSeconds, int stockHats,
                              int stockCups) {
        validate(totalRounds, requiredCorrect, questionSeconds, stockHats, stockCups);
        // Bloqueamos la fila para no pisar un sorteo que esté descontando stock.
        AppSettings settings = repository.findForUpdate().orElseThrow(this::settingsNotFound);
        settings.update(totalRounds, requiredCorrect, questionSeconds, stockHats, stockCups, Instant.now(clock));
        return settings;
    }

    private void validate(int totalRounds, int requiredCorrect, int questionSeconds, int stockHats, int stockCups) {
        if (totalRounds < 1 || totalRounds > 5) {
            throw validation("Las rondas por partida deben estar entre 1 y 5.");
        }
        if (requiredCorrect < 1 || requiredCorrect > totalRounds) {
            throw validation("Los aciertos necesarios deben estar entre 1 y la cantidad de rondas.");
        }
        if (questionSeconds < 5 || questionSeconds > 60) {
            throw validation("Los segundos por pregunta deben estar entre 5 y 60.");
        }
        if (stockHats < 0 || stockHats > 999 || stockCups < 0 || stockCups > 999) {
            throw validation("El stock debe estar entre 0 y 999 unidades.");
        }
    }

    private ApiException validation(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR, message);
    }

    private ApiException settingsNotFound() {
        return new ApiException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ApiErrorCode.SETTINGS_NOT_FOUND,
                "No se encontró la configuración del juego.");
    }
}
