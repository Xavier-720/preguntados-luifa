package com.luifa.preguntados.settings.api;

import com.luifa.preguntados.settings.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/settings")
@Tag(name = "Administración", description = "Configuración y stock del local")
public class AdminSettingsController {

    private final SettingsService settingsService;

    public AdminSettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    @Operation(summary = "Obtener la configuración completa")
    public AdminSettingsResponse get() {
        return AdminSettingsResponse.from(settingsService.get());
    }

    @PutMapping
    @Operation(summary = "Actualizar reglas y stock")
    public AdminSettingsResponse update(@Valid @RequestBody UpdateSettingsRequest request) {
        return AdminSettingsResponse.from(settingsService.update(
                request.totalRounds(),
                request.requiredCorrect(),
                request.questionSeconds(),
                request.stockHats(),
                request.stockCups()));
    }
}
