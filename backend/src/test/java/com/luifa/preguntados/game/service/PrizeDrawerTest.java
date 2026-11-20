package com.luifa.preguntados.game.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.luifa.preguntados.game.domain.PrizeType;
import java.util.Random;
import org.junit.jupiter.api.Test;

class PrizeDrawerTest {

    @Test
    void drawsHatWhenRandomFallsInHatRange() {
        Random random = mock(Random.class);
        when(random.nextInt(10)).thenReturn(0);

        assertThat(new PrizeDrawer(random).draw(5, 5)).isEqualTo(PrizeType.HAT);
    }

    @Test
    void drawsCupWhenRandomFallsInCupRange() {
        Random random = mock(Random.class);
        when(random.nextInt(10)).thenReturn(5);

        assertThat(new PrizeDrawer(random).draw(5, 5)).isEqualTo(PrizeType.CUP);
    }

    @Test
    void respectsStockWeighting() {
        Random random = mock(Random.class);
        when(random.nextInt(12)).thenReturn(9, 11);
        PrizeDrawer drawer = new PrizeDrawer(random);

        assertThat(drawer.draw(10, 2)).isEqualTo(PrizeType.HAT);
        assertThat(drawer.draw(10, 2)).isEqualTo(PrizeType.CUP);
    }

    @Test
    void throwsWhenThereIsNoStock() {
        assertThatThrownBy(() -> new PrizeDrawer(new Random()).draw(0, 0))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
