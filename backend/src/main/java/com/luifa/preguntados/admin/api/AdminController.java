package com.luifa.preguntados.admin.api;

import com.luifa.preguntados.admin.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Administración", description = "Configuración y stock del local")
public class AdminController {

    private final StatsService statsService;

    public AdminController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Obtener estadísticas del local")
    public AdminStatsResponse stats() {
        return statsService.stats();
    }
}
