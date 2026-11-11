# Backend Clareia (Spring Boot) - imagem para o Render.
# Etapa 1: build do jar com Maven + JDK 21.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -ntp -DskipTests clean package

# Etapa 2: imagem enxuta so com o JRE para rodar.
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# O Render injeta a porta em $PORT; o Spring a le em application.properties.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
