# Preguntados · Las Camisetas de Luifa

Juego de preguntas para el local: girá la ruleta, respondé **3 preguntas contra reloj** y, si acertás al menos **2**, sorteá una **gorra** o un **vaso**.

Esta versión es una reescritura completa del juego original en un solo HTML, ahora con una arquitectura moderna separada en **SPA (React + Vite)** y una API con reglas de servidor. La API puede correr con **Spring Boot** en local/Docker o con **Netlify Functions + Blobs** en un despliegue todo-en-uno, sin backend público.

![Java](https://img.shields.io/badge/Java-25-orange?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.2-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111)
![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

## Contenido

- [Capturas](#capturas)
- [Características](#características)
- [Stack](#stack)
- [Arquitectura](#arquitectura)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos](#requisitos)
- [Puesta en marcha local](#puesta-en-marcha-local)
- [Reglas y contenido](#reglas-y-contenido)
- [API](#api)
- [Tests](#tests)
- [Configuración](#configuración)
- [Docker](#docker)
- [Uso en el local (tablet / LAN)](#uso-en-el-local-tablet--lan)
- [Despliegue](#despliegue)
- [Seguridad](#seguridad)
- [Reset de datos](#reset-de-datos)
- [Licencia](#licencia)

## Capturas

| Inicio | Ruleta | Pregunta |
| :---: | :---: | :---: |
| ![Inicio](docs/screenshots/01-home.png) | ![Ruleta](docs/screenshots/02-wheel.png) | ![Pregunta](docs/screenshots/03-question.png) |
| **Respuesta** | **Resultado** | **Premio** |
| ![Respuesta](docs/screenshots/04-answer.png) | ![Resultado](docs/screenshots/05-result-win.png) | ![Premio](docs/screenshots/06-prize.png) |
| **Sin premio** | **Acceso admin** | **Administración** |
| ![Sin premio](docs/screenshots/11-result-loss.png) | ![Acceso admin](docs/screenshots/07-admin-pin.png) | ![Administración](docs/screenshots/08-admin.png) |

## Características

- **Partida completa:** ruleta de 5 categorías, 3 rondas, temporizador, feedback con dato curioso, resultado y sorteo de premio.
- **Dos modos de ejecución:** Spring Boot con H2/PostgreSQL para local y Docker; Netlify Functions con Blobs para producción sin servidor propio.
- **Servidor autoritativo:** la API decide categoría, pregunta, orden de opciones, respuestas correctas, tiempos y premio. El cliente solo dibuja el estado.
- **Anti-trampa básico:** no se envían las respuestas correctas hasta responder; el tiempo se valida en el servidor (con 2 segundos de gracia por latencia).
- **Stock real:** las gorras y los vasos se descuentan únicamente al sortear un premio ganado. El sorteo es ponderado según las unidades disponibles.
- **Panel de administración:** reglas, segundos por pregunta, stock y estadísticas del local, protegido con PIN.
- **Idempotencia:** responder dos veces o reintentar el sorteo no duplica aciertos ni descuenta stock.
- **Responsive:** pensado para tablets en el local y también para celulares.
- **Accesibilidad:** navegación por teclado, foco visible, `aria-live`, respeto por `prefers-reduced-motion` y contraste alto.
- **Extras de experiencia:** confetti al ganar, wake lock para que la pantalla no se apague y animación de ruleta que siempre cae en la categoría elegida por el servidor.
- **Sin infraestructura extra:** local con H2 o PostgreSQL; en Netlify, Functions y Blobs del mismo sitio.

## Stack

| Capa | Tecnologías |
| --- | --- |
| **Backend** | Java 25 · Spring Boot 4.2 · Spring Web MVC · Spring Data JPA · Hibernate · Flyway · Bean Validation · springdoc OpenAPI · Actuator · Maven |
| **Base de datos** | H2 en modo archivo para desarrollo · PostgreSQL 17 para producción |
| **Frontend** | React 19 · TypeScript 7 · Vite 8 · Tailwind CSS 4 · TanStack Query 5 · React Router 7 · lucide-react · Fontsource |
| **Calidad** | JUnit 5 + MockMvc · Vitest + Testing Library · Oxlint · TypeScript estricto |
| **Infra** | Docker multi-stage · nginx · Docker Compose · GitHub Actions |

## Arquitectura

```text
┌──────────────────────────┐        HTTP/JSON        ┌──────────────────────────┐
│  Frontend (React + Vite)  │  ────────────────────▶  │  Backend (Spring Boot)    │
│  · máquina de estados     │       /api/v1/*         │  · reglas y validaciones  │
│  · ruleta y temporizador  │  ◀────────────────────  │  · sesiones y rondas      │
│  · panel /admin           │                         │  · stock y sorteo         │
└──────────────────────────┘                         └────────────┬─────────────┘
                                                                  │ JPA / Flyway
                                                                  ▼
                                                     ┌──────────────────────────┐
                                                     │ H2 (dev) / PostgreSQL     │
                                                     └──────────────────────────┘
```

En Docker, nginx sirve la SPA y hace de proxy de `/api` hacia el contenedor del backend, por lo que el navegador ve un solo origen. Esto permite entrar por `localhost`, `127.0.0.1` o la IP de la tablet en la red local sin conflictos de CORS.

En Netlify no se ejecuta Java. La SPA se publica como sitio estático y una **Netlify Function** (`frontend/netlify/functions/api.ts`) atiende `/api/v1/*` con la misma lógica y los mismos contratos. El estado del juego (reglas, partidas, stock y estadísticas) se guarda en **Netlify Blobs** con escrituras condicionales por ETag, así que dos respuestas o dos sorteos simultáneos no pisan el stock.

```text
Navegador ──▶ Netlify CDN ──▶ SPA estática
     │
     └────────▶ /api/v1/* ──▶ Netlify Function ──▶ Blobs
```

Más detalles de diseño, modelo de datos y decisiones en **[docs/architecture.md](docs/architecture.md)**.

## Estructura del repositorio

```text
preguntados-luifa/
├── backend/
│   ├── src/main/java/com/luifa/preguntados/
│   │   ├── game/         partidas, rondas, respuestas y sorteo
│   │   ├── catalog/      categorías, preguntas y opciones
│   │   ├── settings/     reglas y stock configurables
│   │   ├── admin/        estadísticas del local
│   │   ├── security/     PIN de administración
│   │   ├── seed/         banco de 32 preguntas
│   │   └── common/       manejo de errores
│   ├── src/main/resources/db/migration/   esquema Flyway
│   └── Dockerfile
├── frontend/
│   ├── src/screens/      inicio, ruleta, pregunta, resultado, premio, admin
│   ├── src/game/         contexto y máquina de estados de la partida
│   ├── src/components/   sistema de diseño y ruleta
│   ├── src/api/          cliente tipado y hooks de TanStack Query
│   ├── netlify/functions/ API serverless para Netlify + Blobs
│   └── Dockerfile
├── docs/
│   ├── architecture.md
│   └── screenshots/
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Requisitos

- **JDK 25** y **Maven 3.9+**
- **Node.js 24+** y **npm 11+**
- **Docker Desktop** (opcional, para el despliegue con contenedores)

## Puesta en marcha local

### 1. Backend

```bash
cd backend
mvn spring-boot:run
```

La API queda disponible en:

- API: <http://localhost:8080/api/v1>
- Swagger UI: <http://localhost:8080/swagger-ui.html>
- Health check: <http://localhost:8080/actuator/health>
- Consola H2: <http://localhost:8080/h2-console>  
  JDBC URL `jdbc:h2:file:./data/preguntados`, usuario `sa`, sin contraseña.

En la primera ejecución se crea `backend/data/preguntados.mv.db` y se cargan las 5 categorías con 32 preguntas.

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abrí <http://localhost:5173>. Vite redirige `/api` al backend en el puerto 8080.

### 3. Panel de administración

Entrá a <http://localhost:5173/admin>. El PIN de desarrollo es **`2468`**.

> Cambiá `ADMIN_PIN` antes de publicar el juego. El PIN se guarda solo en `sessionStorage` del navegador; no se persiste en el frontend.

## Reglas y contenido

| Regla | Valor por defecto |
| --- | --- |
| Rondas por partida | 3 |
| Aciertos necesarios | 2 |
| Segundos por pregunta | 15 |
| Stock de gorras | 10 |
| Stock de vasos | 10 |

- Categorías: **Selección**, **Clubes AR**, **Mundiales**, **Clubes del mundo** e **Historia**.
- Cada partida toma una foto de la configuración al iniciar: cambiar las reglas desde el panel afecta a la próxima partida, no a la que está en curso.
- El temporizador se controla en el servidor. Si el cliente no responde a tiempo, envía `optionId: null` y la ronda cuenta como incorrecta.
- El premio se sortea recién cuando la partida terminó y tiene los aciertos necesarios. La probabilidad de gorra/vaso es proporcional al stock restante.
- El stock se descuenta una sola vez por partida ganada; reintentar el sorteo devuelve el mismo premio.

## API

Base: `/api/v1`

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/config` | Configuración pública, categorías y stock |
| `POST` | `/games` | Iniciar una partida |
| `POST` | `/games/{gameId}/spins` | Girar la ruleta y obtener la ronda |
| `POST` | `/games/{gameId}/answers` | Responder (`{ roundId, optionId }`, `null` = timeout) |
| `POST` | `/games/{gameId}/finish` | Finalizar y obtener el resultado |
| `POST` | `/games/{gameId}/prize` | Sortear el premio de una partida ganada |
| `GET` | `/admin/settings` | Leer reglas y stock · requiere `X-Admin-Pin` |
| `PUT` | `/admin/settings` | Actualizar reglas y stock · requiere `X-Admin-Pin` |
| `GET` | `/admin/stats` | Estadísticas del local · requiere `X-Admin-Pin` |

Los errores usan el formato **Problem Details** (`application/problem+json`) con un campo `code` propio (`GAME_NOT_FOUND`, `INVALID_OPTION`, `OUT_OF_STOCK`, etc.).

## Tests

```bash
# Backend: flujo completo, timeout, idempotencia, stock, admin y sorteo
cd backend && mvn test

# Frontend: lógica de la ruleta y componentes
cd frontend && npm test

# Lint y build de producción
cd frontend && npm run lint && npm run build
```

El repositorio incluye **14 tests de backend** y **23 tests de frontend**. Los tests de frontend cubren la ruleta, los componentes y la API serverless (partida completa, timeout, idempotencia, stock, PIN y validaciones). La CI de GitHub Actions ejecuta todo en cada push y pull request, además de construir ambas imágenes Docker.

## Configuración

### Backend

| Variable | Default | Descripción |
| --- | --- | --- |
| `PORT` | `8080` | Puerto HTTP |
| `ADMIN_PIN` | `2468` | PIN del panel de administración |
| `APP_TIMEZONE` | `America/Argentina/Buenos_Aires` | Zona horaria de las estadísticas |
| `CORS_ALLOWED_ORIGINS` | `localhost:5173`, `127.0.0.1:5173`, `localhost:4173`, `127.0.0.1:4173` | Orígenes permitidos, separados por coma |
| `SPRING_PROFILES_ACTIVE` | vacío (H2) | Usar `postgres` para PostgreSQL |
| `DB_HOST` / `DB_PORT` | `localhost` / `5432` | Conexión PostgreSQL (perfil `postgres`) |
| `DB_NAME` | `preguntados` | Nombre de la base |
| `DB_USER` / `DB_PASSWORD` | `preguntados` / `preguntados` | Credenciales de la base |

### Frontend

| Variable | Default | Descripción |
| --- | --- | --- |
| `VITE_API_URL` | `/api/v1` | URL base de la API. En desarrollo y Docker se deja así; en Netlify tampoco hace falta cambiarla |

### Netlify Functions

| Variable | Default | Descripción |
| --- | --- | --- |
| `ADMIN_PIN` | `2468` | PIN del panel de administración. **Cambialo en producción** |
| `APP_TIMEZONE` | `America/Argentina/Buenos_Aires` | Zona horaria usada para “hoy” en las estadísticas |
| `BLOBS_STORE_NAME` | `preguntados` | Nombre base del store de Blobs. Cambialo para empezar de cero |

Las variables se configuran en **Site configuration → Environment variables**. No hace falta `VITE_API_URL` ni una base de datos: la API serverless usa el mismo origen y Netlify Blobs.

> Los deploy previews y branch deploys usan un store separado (`preguntados-deploy-preview`, etc.) para no mezclar datos con producción. El sitio de producción usa el nombre base.

## Docker

La forma más simple de levantar todo junto (PostgreSQL + API + nginx):

```bash
cp .env.example .env
docker compose up -d --build
```

> En Windows podés usar `Copy-Item .env.example .env`. Docker Desktop tiene que estar iniciado.

- Juego: <http://localhost:8081>
- API directa: <http://localhost:8080/api/v1>
- Swagger: <http://localhost:8080/swagger-ui.html>

Antes de publicar, editá `.env` y cambiá como mínimo `ADMIN_PIN` y `POSTGRES_PASSWORD`. Los datos de PostgreSQL quedan en el volumen `postgres-data`.

```bash
# Detener
docker compose down

# Detener y borrar también la base de datos
docker compose down -v
```

El despliegue con contenedores fue **probado de punta a punta** con Docker 29.9.3, Docker Compose v5.7.0 y PostgreSQL 17.12. La verificación incluyó: arranque del stack desde una base vacía, migración Flyway y carga de las 32 preguntas, partida completa a través de nginx hasta el premio, stock descontado, sorteo idempotente, panel de administración con PIN, rechazo de PIN inválido (`401`) y reinicio de reglas/stock.

## Uso en el local (tablet / LAN)

Con Docker, la tablet puede jugar sin instalar nada:

1. Asegurate de que la tablet y la computadora estén en la **misma red Wi-Fi**.
2. En la computadora, obtené la IP local:

   ```powershell
   ipconfig
   ```

   Buscá la IPv4 de la interfaz Wi-Fi, por ejemplo `192.168.0.50`.
3. En la tablet, abrí `http://192.168.0.50:8081`.
4. Si no carga, permití el puerto **8081** en el firewall de Windows (Red privada).

El panel de administración queda en `http://192.168.0.50:8081/admin`. Como nginx sirve la SPA y proxya `/api` en el mismo origen, funciona igual entrando por `localhost`, `127.0.0.1` o la IP de la LAN.

| Inicio en celular | Ruleta en celular |
| :---: | :---: |
| ![Inicio móvil](docs/screenshots/09-home-mobile.png) | ![Ruleta móvil](docs/screenshots/10-wheel-mobile.png) |

## Despliegue

### Opción A — Netlify todo-en-uno (sin backend propio)

Netlify publica la SPA y ejecuta la API en una Function. No hace falta Spring Boot, VPS ni PostgreSQL: los datos se guardan en Netlify Blobs.

1. Importá `Xavier-720/preguntados-luifa` en Netlify y usá estos valores:

   | Campo | Valor |
   | --- | --- |
   | Base directory | `frontend` |
   | Build command | `npm run build` |
   | Publish directory | `dist` |
   | Functions directory | `netlify/functions` |
   | Node version | `24` |

   El `netlify.toml` de la raíz ya define todo esto, incluido el fallback de React Router para `/admin`.

2. En **Site configuration → Environment variables** agregá como mínimo:

   ```text
   ADMIN_PIN=un-pin-nuevo-de-4-a-12-digitos
   ```

   Opcionalmente podés definir `APP_TIMEZONE` y `BLOBS_STORE_NAME`. **No configures `VITE_API_URL`**: el cliente usa `/api/v1` en el mismo origen.

3. Deploy site. La primera request crea automáticamente la configuración inicial (3 rondas, 2 aciertos, 15 segundos, stock 10/10) y el store de Blobs.

4. Abrí `https://tu-sitio.netlify.app/admin` e ingresá el PIN configurado.

Notas:

- La Function atiende `/api/v1/*` y se resuelve antes del fallback de la SPA.
- Netlify Blobs es persistente entre deploys y no requiere base de datos ni credenciales extra.
- Los preview deploys usan un store separado para no tocar las partidas ni el stock de producción.
- Si cambiás el PIN, las reglas o el stock desde `/admin`, se aplican en el acto.

### Opción B — un solo servidor con Docker Compose

Copiá el repositorio al servidor, creá el `.env` de producción y levantá `docker compose up -d --build` detrás de un reverse proxy con HTTPS (Caddy, Traefik o nginx).

### Opción C — Netlify + Spring Boot gestionado

Si preferís mantener Java en producción, desplegá `backend/` en Render, Railway, Fly.io o un VPS con Java 25 y PostgreSQL. Después configurá en Netlify `VITE_API_URL=https://tu-backend.ejemplo.com/api/v1` y en el backend `CORS_ALLOWED_ORIGINS=https://tu-sitio.netlify.app`. Esta opción requiere un backend público y no es necesaria para jugar en Netlify.

Recomendaciones para producción:

- Cambiar el PIN por defecto (`ADMIN_PIN`) y usar una contraseña de base de datos fuerte si usás PostgreSQL.
- Servir todo por HTTPS.
- Desactivar Swagger y la consola H2 si no los necesitás (`SPRINGDOC_API_DOCS_ENABLED=false`, `SPRINGDOC_SWAGGER_UI_ENABLED=false`; el perfil `postgres` ya desactiva H2).
- Programar backups del volumen de PostgreSQL o del store de Blobs si los datos son críticos.

## Seguridad

- El PIN de administración es una **barrera operativa** para una tablet detrás del mostrador, no un sistema de autenticación para exponer el panel a internet.
- El PIN se envía en el header `X-Admin-Pin` y se guarda solo en `sessionStorage`; nunca forma parte del bundle ni de la base de datos.
- En Netlify, el PIN se configura con la variable `ADMIN_PIN` de las Functions y se compara en tiempo constante. El valor por defecto `2468` es público: cambialo antes de compartir el sitio.
- Si el juego va a estar accesible desde internet, poné el panel detrás de HTTPS y de una capa de autenticación real (VPN, reverse proxy con basic auth, Cloudflare Access, etc.).
- Cambiá `ADMIN_PIN` y `POSTGRES_PASSWORD` antes de publicar. No commitees el archivo `.env`.
- La API Spring Boot aplica CORS solo a los orígenes configurados. En Docker y en Netlify el navegador usa el mismo origen, así que no hace falta abrir CORS a toda la red.

## Reset de datos

- **Local (H2):** detené el backend y borrá la carpeta `backend/data/`. Al reiniciar se vuelve a crear con el stock 10/10 y las 32 preguntas.
- **Docker (PostgreSQL):** `docker compose down -v` y luego `docker compose up -d --build`.
- **Netlify:** las reglas y el stock se reinician desde `/admin`. Para borrar también partidas y estadísticas, cambiá `BLOBS_STORE_NAME` por un nombre nuevo y volvé a desplegar; se crea un store limpio con los valores iniciales.

## Licencia

Código publicado bajo licencia [MIT](LICENSE). El nombre, el logo y la identidad de **Las Camisetas de Luifa** pertenecen a su dueño.
