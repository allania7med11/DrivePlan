#!/bin/bash
# DrivePlan Backend Startup Script

# Change to backend directory (following ChatTagAI pattern)
cd /app/backend

# Wait a moment for any dependencies
sleep 2

echo "🚛 Starting DrivePlan Backend..."

# Run migrations if MIGRATE is true
if [ "${MIGRATE:-true}" = "true" ]; then
    echo "Running Django migrations..."
    python manage.py migrate --noinput
fi

# Start the application based on the environment
if [ "$ENVIRONMENT" = "debug" ]; then
    sleep infinity
elif [ "$ENVIRONMENT" = "dev" ]; then
    python manage.py runserver 0.0.0.0:$PORT
elif [ "$ENVIRONMENT" = "prod" ]; then
    gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 3
fi