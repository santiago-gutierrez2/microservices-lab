FROM eclipse-temurin:17-jdk as build
WORKDIR /app

COPY mvnw .
COPY .mvn/ .mvn/
COPY pom.xml .
RUN ./mvnw dependency:go-offline

COPY src/ src/
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:17-jre as runtime
WORKDIR /app

RUN useradd --system --no-create-home appuser
USER appuser

COPY --from=build /app/target/order-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]