import type { CategorySummary, CategoryView } from './types'

interface CatalogOption {
  id: number
  label: string
  correct: boolean
}

export interface CatalogQuestion {
  id: number
  categoryId: number
  prompt: string
  fact: string
  options: CatalogOption[]
}

export interface CatalogCategory {
  id: number
  name: string
  color: string
  displayOrder: number
  questions: CatalogQuestion[]
}

interface RawQuestion {
  prompt: string
  options: [string, string, string, string]
  fact: string
}

interface RawCategory {
  name: string
  color: string
  questions: RawQuestion[]
}

// La primera opción de cada pregunta es la respuesta correcta.
const RAW_CATEGORIES: RawCategory[] = [
  {
    name: 'Selección',
    color: '#6cc4ee',
    questions: [
      {
        prompt: '¿Cuántas estrellas lleva la camiseta de Argentina desde Qatar 2022?',
        options: ['3', '2', '4', '1'],
        fact: 'Por los títulos de 1978, 1986 y 2022.',
      },
      {
        prompt: '¿Qué marca viste hoy a la Selección Argentina?',
        options: ['Adidas', 'Nike', 'Puma', 'Le Coq Sportif'],
        fact: 'Adidas la viste desde fines de los 90.',
      },
      {
        prompt: '¿Qué marca hizo la camiseta de Argentina en México 86?',
        options: ['Le Coq Sportif', 'Adidas', 'Umbro', 'Topper'],
        fact: 'La francesa Le Coq Sportif.',
      },
      {
        prompt: 'Contra Inglaterra en el 86, Argentina jugó con camiseta de color...',
        options: ['Azul', 'Blanca', 'Negra', 'Celeste'],
        fact: 'Usó la azul alternativa, conseguida a último momento.',
      },
      {
        prompt: '¿Con qué número jugó Messi su primer Mundial (Alemania 2006)?',
        options: ['19', '10', '18', '30'],
        fact: 'Recién después heredó la 10.',
      },
      {
        prompt: '¿Cómo son las rayas de la camiseta titular argentina?',
        options: ['Verticales celestes y blancas', 'Horizontales', 'Diagonales', 'No tiene rayas'],
        fact: 'Los clásicos bastones albicelestes.',
      },
    ],
  },
  {
    name: 'Clubes AR',
    color: '#ffd23f',
    questions: [
      {
        prompt: 'Los colores de Boca se inspiraron en la bandera de un barco de...',
        options: ['Suecia', 'Italia', 'Inglaterra', 'Grecia'],
        fact: 'Un barco sueco que entró al puerto de La Boca.',
      },
      {
        prompt: '¿Qué tiene la camiseta de River?',
        options: ['Una banda roja diagonal', 'Rayas rojas verticales', 'Una V roja', 'Cuadros rojos'],
        fact: 'La banda cruzada, de hombro a cintura.',
      },
      {
        prompt: '¿Qué club juega con una V azul en el pecho?',
        options: ['Vélez', 'Racing', 'Tigre', 'Gimnasia'],
        fact: 'La V azulada sobre fondo blanco.',
      },
      {
        prompt: "La camiseta de Newell's es...",
        options: ['Mitad roja y mitad negra', 'A rayas rojas y negras', 'Toda roja', 'Negra con banda roja'],
        fact: 'Rojo y negro, mitad y mitad.',
      },
      {
        prompt: '¿Qué club usa los colores azul y amarillo en Rosario?',
        options: ['Rosario Central', "Newell's", 'Argentino de Rosario', 'Tiro Federal'],
        fact: 'El Canalla, auriazul.',
      },
      {
        prompt: '¿Cuál de estos clubes viste de azulgrana?',
        options: ['San Lorenzo', 'Independiente', 'Huracán', 'Lanús'],
        fact: 'El Ciclón, de Boedo.',
      },
      {
        prompt: 'Estudiantes de La Plata juega con...',
        options: ['Bastones rojos y blancos', 'Rayas azules', 'Camiseta toda roja', 'Franja horizontal'],
        fact: 'El Pincha, rojiblanco a bastones.',
      },
    ],
  },
  {
    name: 'Mundiales',
    color: '#3ddc84',
    questions: [
      {
        prompt: '¿Cuántas estrellas tiene la camiseta de Brasil?',
        options: ['5', '4', '3', '6'],
        fact: 'Pentacampeón: 58, 62, 70, 94 y 2002.',
      },
      {
        prompt: '¿De qué color juega Países Bajos?',
        options: ['Naranja', 'Rojo', 'Azul', 'Blanco'],
        fact: 'Por la Casa de Orange.',
      },
      {
        prompt: '¿Qué selección juega con un damero rojo y blanco?',
        options: ['Croacia', 'Polonia', 'Suiza', 'Dinamarca'],
        fact: 'El famoso tablero croata.',
      },
      {
        prompt: '¿En qué Mundial fueron obligatorios los nombres en la espalda?',
        options: ['Estados Unidos 94', 'Italia 90', 'México 86', 'Francia 98'],
        fact: 'Se estrenaron en USA 94.',
      },
      {
        prompt: "A la selección italiana le dicen la 'Azzurra' por su camiseta...",
        options: ['Azul', 'Celeste y blanca', 'Verde', 'Blanca'],
        fact: 'El azul de la Casa de Saboya.',
      },
      {
        prompt: '¿Cuántas estrellas lleva Uruguay en su escudo?',
        options: ['4', '2', '3', '1'],
        fact: '2 Mundiales y 2 oros olímpicos (24 y 28).',
      },
      {
        prompt: '¿De qué color es la camiseta titular de México?',
        options: ['Verde', 'Roja', 'Blanca', 'Negra'],
        fact: 'El Tri juega de verde.',
      },
    ],
  },
  {
    name: 'Clubes del mundo',
    color: '#ff7a59',
    questions: [
      {
        prompt: 'Juventus tomó sus rayas blancas y negras de un club de...',
        options: ['Inglaterra', 'Escocia', 'Francia', 'Uruguay'],
        fact: 'Del Notts County inglés.',
      },
      {
        prompt: '¿De qué color juega el Real Madrid?',
        options: ['Blanco', 'Azul', 'Violeta', 'Negro'],
        fact: "Por eso le dicen 'Merengue'.",
      },
      {
        prompt: '¿Qué club inglés tiene camiseta roja con mangas blancas?',
        options: ['Arsenal', 'Liverpool', 'Manchester United', 'Chelsea'],
        fact: 'Un clásico de los Gunners.',
      },
      {
        prompt: 'El Barcelona llevó por primera vez en el pecho el nombre de...',
        options: ['UNICEF', 'Qatar', 'Spotify', 'Rakuten'],
        fact: 'UNICEF, en 2006, sin cobrar.',
      },
      {
        prompt: '¿Qué número usó Messi en el PSG?',
        options: ['30', '10', '19', '11'],
        fact: 'La 10 era de Neymar.',
      },
      {
        prompt: '¿De qué color es la camiseta del Chelsea?',
        options: ['Azul', 'Roja', 'Blanca', 'Verde'],
        fact: 'Los Blues de Londres.',
      },
    ],
  },
  {
    name: 'Historia',
    color: '#c58cff',
    questions: [
      {
        prompt: '¿Qué número hizo inmortal Maradona?',
        options: ['10', '9', '7', '11'],
        fact: 'La 10, en Boca, Napoli y la Selección.',
      },
      {
        prompt: '¿En qué Mundial los números quedaron fijos por jugador?',
        options: ['Suiza 54', 'Uruguay 30', 'Chile 62', 'Inglaterra 66'],
        fact: 'Desde 1954 cada jugador tuvo su número.',
      },
      {
        prompt: '¿Qué marca usa tres tiras como logo?',
        options: ['Adidas', 'Puma', 'Nike', 'Umbro'],
        fact: 'Las tres tiras de Adidas.',
      },
      {
        prompt: '¿Qué número usó Messi al debutar en la Primera del Barça?',
        options: ['30', '10', '19', '9'],
        fact: 'Después vino la 19 y luego la 10.',
      },
      {
        prompt: '¿De qué color juega Japón?',
        options: ['Azul', 'Blanco', 'Rojo', 'Negro'],
        fact: "Les dicen 'Samurai Blue'.",
      },
      {
        prompt: '¿Cuántas estrellas lleva la camiseta de Francia?',
        options: ['2', '1', '3', '0'],
        fact: 'Por 1998 y 2018.',
      },
    ],
  },
]

function buildCatalog(): CatalogCategory[] {
  let questionId = 1
  let optionId = 1

  return RAW_CATEGORIES.map((category, categoryIndex) => {
    const id = categoryIndex + 1
    return {
      id,
      name: category.name,
      color: category.color,
      displayOrder: categoryIndex,
      questions: category.questions.map((question) => {
        const builtQuestion: CatalogQuestion = {
          id: questionId,
          categoryId: id,
          prompt: question.prompt,
          fact: question.fact,
          options: question.options.map((label, optionIndex) => ({
            id: optionId++,
            label,
            correct: optionIndex === 0,
          })),
        }
        questionId++
        return builtQuestion
      }),
    }
  })
}

export const CATEGORIES = buildCatalog()

export const QUESTIONS = new Map(
  CATEGORIES.flatMap((category) => category.questions).map((question) => [question.id, question]),
)

export function findCategory(categoryId: number): CatalogCategory | undefined {
  return CATEGORIES.find((category) => category.id === categoryId)
}

export function findQuestion(questionId: number): CatalogQuestion | undefined {
  return QUESTIONS.get(questionId)
}

export function toCategorySummary(category: CatalogCategory): CategorySummary {
  return {
    id: category.id,
    name: category.name,
    color: category.color,
    questionCount: category.questions.length,
  }
}

export function toCategoryView(category: CatalogCategory): CategoryView {
  return { id: category.id, name: category.name, color: category.color }
}

export function playableCategories(): CategorySummary[] {
  return CATEGORIES.filter((category) => category.questions.length > 0).map(toCategorySummary)
}

export function allCategories(): CategorySummary[] {
  return CATEGORIES.map(toCategorySummary)
}
