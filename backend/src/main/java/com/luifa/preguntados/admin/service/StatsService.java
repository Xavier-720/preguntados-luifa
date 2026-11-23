package com.luifa.preguntados.admin.service;

import com.luifa.preguntados.admin.api.AdminStatsResponse;
import com.luifa.preguntados.catalog.service.CatalogService;
import com.luifa.preguntados.config.AppProperties;
import com.luifa.preguntados.game.domain.GameStatus;
import com.luifa.preguntados.game.repo.GameSessionRepository;
import com.luifa.preguntados.settings.domain.AppSettings;
import com.luifa.preguntados.settings.service.SettingsService;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StatsService {

    private final GameSessionRepository sessionRepository;
    private final SettingsService settingsService;
    private final CatalogService catalogService;
    private final AppProperties properties;
    private final Clock clock;

    public StatsService(GameSessionRepository sessionRepository,
                        SettingsService settingsService,
                        CatalogService catalogService,
                        AppProperties properties,
                        Clock clock) {
        this.sessionRepository = sessionRepository;
        this.settingsService = settingsService;
        this.catalogService = catalogService;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse stats() {
        // "Hoy" se calcula en la zona horaria del local, no en UTC.
        ZoneId zone = ZoneId.of(properties.timezone());
        Instant since = LocalDate.now(clock.withZone(zone)).atStartOfDay(zone).toInstant();
        AppSettings settings = settingsService.get();

        return new AdminStatsResponse(
                sessionRepository.count(),
                sessionRepository.countByStartedAtGreaterThanEqual(since),
                sessionRepository.countWins(GameStatus.FINISHED),
                sessionRepository.countWinsSince(GameStatus.FINISHED, since),
                sessionRepository.countByPrizeIsNotNull(),
                sessionRepository.countByPrizeIsNotNullAndPrizeAwardedAtGreaterThanEqual(since),
                settings.getStockHats(),
                settings.getStockCups(),
                catalogService.allCategories());
    }
}
