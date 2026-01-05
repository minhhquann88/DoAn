# 1. Build Stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# 2. Run Stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Render uses PORT env var, default to 10000 if not set
EXPOSE 10000
ENV PORT=10000
# Use PORT from environment variable (Render sets this automatically)
ENTRYPOINT ["sh", "-c", "java -jar -Dserver.port=${PORT:-10000} app.jar"]

