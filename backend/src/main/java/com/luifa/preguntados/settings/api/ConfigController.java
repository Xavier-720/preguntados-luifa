package com.luifa.preguntados.settings.api;

import com.luifa.preguntados.catalog.service.CatalogService;
import com.luifa.preguntados.settings.domain.AppSettings;
import com.luifa.preguntados.settings.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Configuración pública", description = "Reglas y stock visibles para los jugadores")
public class ConfigController {

    private final SettingsService settingsService;
    private final CatalogService catalogService;

    public ConfigController(SettingsService settingsService, CatalogService catalogService) {
        this.settingsService = settingsService;
        this.catalogService = catalogService;
    }

    @GetMapping("/config")
    @Operation(summary = "Obtener reglas, stock y categorías del juego")
    public ConfigResponse config() {
        AppSettings settings = settingsService.get();
        return new ConfigResponse(
                settings.getTotalRounds(),
                settings.getRequiredCorrect(),
                settings.getQuestionSeconds(),
                settings.getStockHats(),
                settings.getStockCups(),
                catalogService.playableCategories());
    }
}
