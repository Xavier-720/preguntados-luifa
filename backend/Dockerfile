# syntax=docker/dockerfile:1

FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /workspace

# Cachear dependencias antes de copiar el código fuente.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q clean package -DskipTests

FROM eclipse-temurin:25-jre AS runtime
WORKDIR /app

RUN groupadd --system app \
    && useradd --system --gid app --home-dir /app app \
    && mkdir -p /app/data \
    && chown -R app:app /app

COPY --from=build /workspace/target/preguntados-api.jar /app/app.jar

USER app
EXPOSE 8080

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
