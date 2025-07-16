# DrivePlan Backend Dockerfile
FROM python:3.11-slim as base

# System dependencies
RUN apt-get update && apt-get install -y \
    locales gcc && \
    rm -rf /var/lib/apt/lists/*

# Locale setup
RUN sed -i 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && locale-gen
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

# Python environment
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

# User setup
ARG APP_UID=1000
RUN adduser -u $APP_UID --disabled-password --gecos "" appuser

#########################################
# Common application stage
#########################################
FROM base as app

# Working directory setup
WORKDIR /app
RUN chown -R appuser:appuser /app

# Copy backend code
COPY . ./backend

# Install Python dependencies
WORKDIR /app/backend
RUN pip install --upgrade pip && pip install -r requirements.txt

# Back to app root for runtime
WORKDIR /app
RUN chown -R appuser:appuser /app

USER appuser
EXPOSE 8000
ENTRYPOINT ["sh", "./backend/run.sh"]

#########################################
# Development stage
#########################################
FROM app as development

# Switch back to root to install dev tools
USER root

# Install development tools
RUN apt-get update && apt-get install -y \
    curl git vim && \
    rm -rf /var/lib/apt/lists/*

# Switch back to appuser
USER appuser

#########################################
# Production stage
#########################################
FROM app as production

# Production stage inherits everything from app
# No additional setup needed