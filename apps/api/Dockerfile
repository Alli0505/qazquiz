# ── build stage ───────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradle gradle
COPY gradlew settings.gradle.kts build.gradle.kts ./
# warm the dependency cache
RUN ./gradlew --no-daemon dependencies >/dev/null 2>&1 || true
COPY src src
RUN ./gradlew --no-daemon bootJar

# ── run stage ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
