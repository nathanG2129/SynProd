# Multi-stage Dockerfile for SynProd Spring Boot Application
# Stage 1: Build the application
FROM eclipse-temurin:21-jdk-alpine AS build

# Set working directory
WORKDIR /app

# Install necessary packages for build
RUN apk add --no-cache curl

# Copy Gradle wrapper and build files
COPY gradlew .
COPY gradle/ gradle/
COPY build.gradle .
COPY settings.gradle .

# Make gradlew executable
RUN chmod +x ./gradlew

# Copy source code
COPY src/ src/

# Build the application (skip tests for faster build)
RUN ./gradlew build -x test --no-daemon

# Stage 2: Create production image
FROM eclipse-temurin:21-jre-alpine AS production

# Set working directory
WORKDIR /app

# Install necessary packages for production
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -S synprod && adduser -S synprod -G synprod

# Copy the built JAR from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Create logs directory
RUN mkdir -p /var/log/synprod && \
    chown -R synprod:synprod /var/log/synprod && \
    chown -R synprod:synprod /app

# Switch to non-root user
USER synprod

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# JVM optimization for production
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseStringDeduplication -XX:+OptimizeStringConcat"

# Application startup
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
