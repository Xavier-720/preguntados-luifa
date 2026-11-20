package com.luifa.preguntados.settings.repo;

import com.luifa.preguntados.settings.domain.AppSettings;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface AppSettingsRepository extends JpaRepository<AppSettings, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from AppSettings s where s.id = 1")
    Optional<AppSettings> findForUpdate();
}
