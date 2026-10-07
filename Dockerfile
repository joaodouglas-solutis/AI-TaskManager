FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -q clean package -DskipTests \
    && cp target/*.jar target/app.jar


FROM eclipse-temurin:21-jre-ubi10-minimal

WORKDIR /app

COPY --from=build /app/target/app.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]