package com.luifa.preguntados.seed;

import java.util.List;

/**
 * Banco de preguntas original de Preguntados Luifa.
 * La primera opción de cada pregunta es la respuesta correcta.
 */
public final class QuestionBank {

    private QuestionBank() {
    }

    public static List<CategorySeed> all() {
        return List.of(
                new CategorySeed("Selección", "#6cc4ee", List.of(
                        new QuestionSeed(
                                "¿Cuántas estrellas lleva la camiseta de Argentina desde Qatar 2022?",
                                List.of("3", "2", "4", "1"),
                                "3",
                                "Por los títulos de 1978, 1986 y 2022."),
                        new QuestionSeed(
                                "¿Qué marca viste hoy a la Selección Argentina?",
                                List.of("Adidas", "Nike", "Puma", "Le Coq Sportif"),
                                "Adidas",
                                "Adidas la viste desde fines de los 90."),
                        new QuestionSeed(
                                "¿Qué marca hizo la camiseta de Argentina en México 86?",
                                List.of("Le Coq Sportif", "Adidas", "Umbro", "Topper"),
                                "Le Coq Sportif",
                                "La francesa Le Coq Sportif."),
                        new QuestionSeed(
                                "Contra Inglaterra en el 86, Argentina jugó con camiseta de color...",
                                List.of("Azul", "Blanca", "Negra", "Celeste"),
                                "Azul",
                                "Usó la azul alternativa, conseguida a último momento."),
                        new QuestionSeed(
                                "¿Con qué número jugó Messi su primer Mundial (Alemania 2006)?",
                                List.of("19", "10", "18", "30"),
                                "19",
                                "Recién después heredó la 10."),
                        new QuestionSeed(
                                "¿Cómo son las rayas de la camiseta titular argentina?",
                                List.of("Verticales celestes y blancas", "Horizontales", "Diagonales", "No tiene rayas"),
                                "Verticales celestes y blancas",
                                "Los clásicos bastones albicelestes.")
                )),
                new CategorySeed("Clubes AR", "#ffd23f", List.of(
                        new QuestionSeed(
                                "Los colores de Boca se inspiraron en la bandera de un barco de...",
                                List.of("Suecia", "Italia", "Inglaterra", "Grecia"),
                                "Suecia",
                                "Un barco sueco que entró al puerto de La Boca."),
                        new QuestionSeed(
                                "¿Qué tiene la camiseta de River?",
                                List.of("Una banda roja diagonal", "Rayas rojas verticales", "Una V roja", "Cuadros rojos"),
                                "Una banda roja diagonal",
                                "La banda cruzada, de hombro a cintura."),
                        new QuestionSeed(
                                "¿Qué club juega con una V azul en el pecho?",
                                List.of("Vélez", "Racing", "Tigre", "Gimnasia"),
                                "Vélez",
                                "La V azulada sobre fondo blanco."),
                        new QuestionSeed(
                                "La camiseta de Newell's es...",
                                List.of("Mitad roja y mitad negra", "A rayas rojas y negras", "Toda roja", "Negra con banda roja"),
                                "Mitad roja y mitad negra",
                                "Rojo y negro, mitad y mitad."),
                        new QuestionSeed(
                                "¿Qué club usa los colores azul y amarillo en Rosario?",
                                List.of("Rosario Central", "Newell's", "Argentino de Rosario", "Tiro Federal"),
                                "Rosario Central",
                                "El Canalla, auriazul."),
                        new QuestionSeed(
                                "¿Cuál de estos clubes viste de azulgrana?",
                                List.of("San Lorenzo", "Independiente", "Huracán", "Lanús"),
                                "San Lorenzo",
                                "El Ciclón, de Boedo."),
                        new QuestionSeed(
                                "Estudiantes de La Plata juega con...",
                                List.of("Bastones rojos y blancos", "Rayas azules", "Camiseta toda roja", "Franja horizontal"),
                                "Bastones rojos y blancos",
                                "El Pincha, rojiblanco a bastones.")
                )),
                new CategorySeed("Mundiales", "#3ddc84", List.of(
                        new QuestionSeed(
                                "¿Cuántas estrellas tiene la camiseta de Brasil?",
                                List.of("5", "4", "3", "6"),
                                "5",
                                "Pentacampeón: 58, 62, 70, 94 y 2002."),
                        new QuestionSeed(
                                "¿De qué color juega Países Bajos?",
                                List.of("Naranja", "Rojo", "Azul", "Blanco"),
                                "Naranja",
                                "Por la Casa de Orange."),
                        new QuestionSeed(
                                "¿Qué selección juega con un damero rojo y blanco?",
                                List.of("Croacia", "Polonia", "Suiza", "Dinamarca"),
                                "Croacia",
                                "El famoso tablero croata."),
                        new QuestionSeed(
                                "¿En qué Mundial fueron obligatorios los nombres en la espalda?",
                                List.of("Estados Unidos 94", "Italia 90", "México 86", "Francia 98"),
                                "Estados Unidos 94",
                                "Se estrenaron en USA 94."),
                        new QuestionSeed(
                                "A la selección italiana le dicen la 'Azzurra' por su camiseta...",
                                List.of("Azul", "Celeste y blanca", "Verde", "Blanca"),
                                "Azul",
                                "El azul de la Casa de Saboya."),
                        new QuestionSeed(
                                "¿Cuántas estrellas lleva Uruguay en su escudo?",
                                List.of("4", "2", "3", "1"),
                                "4",
                                "2 Mundiales y 2 oros olímpicos (24 y 28)."),
                        new QuestionSeed(
                                "¿De qué color es la camiseta titular de México?",
                                List.of("Verde", "Roja", "Blanca", "Negra"),
                                "Verde",
                                "El Tri juega de verde.")
                )),
                new CategorySeed("Clubes del mundo", "#ff7a59", List.of(
                        new QuestionSeed(
                                "Juventus tomó sus rayas blancas y negras de un club de...",
                                List.of("Inglaterra", "Escocia", "Francia", "Uruguay"),
                                "Inglaterra",
                                "Del Notts County inglés."),
                        new QuestionSeed(
                                "¿De qué color juega el Real Madrid?",
                                List.of("Blanco", "Azul", "Violeta", "Negro"),
                                "Blanco",
                                "Por eso le dicen 'Merengue'."),
                        new QuestionSeed(
                                "¿Qué club inglés tiene camiseta roja con mangas blancas?",
                                List.of("Arsenal", "Liverpool", "Manchester United", "Chelsea"),
                                "Arsenal",
                                "Un clásico de los Gunners."),
                        new QuestionSeed(
                                "El Barcelona llevó por primera vez en el pecho el nombre de...",
                                List.of("UNICEF", "Qatar", "Spotify", "Rakuten"),
                                "UNICEF",
                                "UNICEF, en 2006, sin cobrar."),
                        new QuestionSeed(
                                "¿Qué número usó Messi en el PSG?",
                                List.of("30", "10", "19", "11"),
                                "30",
                                "La 10 era de Neymar."),
                        new QuestionSeed(
                                "¿De qué color es la camiseta del Chelsea?",
                                List.of("Azul", "Roja", "Blanca", "Verde"),
                                "Azul",
                                "Los Blues de Londres.")
                )),
                new CategorySeed("Historia", "#c58cff", List.of(
                        new QuestionSeed(
                                "¿Qué número hizo inmortal Maradona?",
                                List.of("10", "9", "7", "11"),
                                "10",
                                "La 10, en Boca, Napoli y la Selección."),
                        new QuestionSeed(
                                "¿En qué Mundial los números quedaron fijos por jugador?",
                                List.of("Suiza 54", "Uruguay 30", "Chile 62", "Inglaterra 66"),
                                "Suiza 54",
                                "Desde 1954 cada jugador tuvo su número."),
                        new QuestionSeed(
                                "¿Qué marca usa tres tiras como logo?",
                                List.of("Adidas", "Puma", "Nike", "Umbro"),
                                "Adidas",
                                "Las tres tiras de Adidas."),
                        new QuestionSeed(
                                "¿Qué número usó Messi al debutar en la Primera del Barça?",
                                List.of("30", "10", "19", "9"),
                                "30",
                                "Después vino la 19 y luego la 10."),
                        new QuestionSeed(
                                "¿De qué color juega Japón?",
                                List.of("Azul", "Blanco", "Rojo", "Negro"),
                                "Azul",
                                "Les dicen 'Samurai Blue'."),
                        new QuestionSeed(
                                "¿Cuántas estrellas lleva la camiseta de Francia?",
                                List.of("2", "1", "3", "0"),
                                "2",
                                "Por 1998 y 2018.")
                ))
        );
    }

    public record CategorySeed(String name, String color, List<QuestionSeed> questions) {
    }

    public record QuestionSeed(String prompt, List<String> options, String answer, String fact) {
    }
}
