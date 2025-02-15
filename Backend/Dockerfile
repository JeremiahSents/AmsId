FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy pre-built JAR file
COPY target/amsIdea-0.0.1-SNAPSHOT.jar /app/amsIdea.jar

ENV PORT=8080

CMD ["java", "-jar", "-Dserver.port=$PORT", "amsIdea.jar"]