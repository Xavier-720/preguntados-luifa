package com.luifa.preguntados.game.service;

import com.luifa.preguntados.game.domain.PrizeType;
import java.util.Random;
import org.springframework.stereotype.Component;

@Component
public class PrizeDrawer {

    private final Random random;

    public PrizeDrawer(Random random) {
        this.random = random;
    }

    public PrizeType draw(int stockHats, int stockCups) {
        int total = stockHats + stockCups;
        if (total <= 0) {
            throw new IllegalArgumentException("No hay stock disponible para sortear");
        }
        return random.nextInt(total) < stockHats ? PrizeType.HAT : PrizeType.CUP;
    }
}
