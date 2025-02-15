FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy pre-built JAR file
COPY target/amsIdea-0.0.1-SNAPSHOT.jar /app/amsIdea.jar

# Set environment variables
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
ENV GOOGLE_CLOUD_PROJECT=amsidea

# Run the application
CMD ["java", "-jar", "amsIdea.jar"]