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

# Collect static files if needed (development)
if [ "${COLLECTSTATIC:-false}" = "true" ]; then
    echo "Collecting static files..."
    python manage.py collectstatic --noinput
fi

# Start the appropriate server based on environment
if [ "${ENVIRONMENT:-dev}" = "prod" ]; then
    echo "Starting production server with gunicorn..."
    exec gunicorn --bind 0.0.0.0:${PORT:-8000} \
                  --workers 2 \
                  --timeout 30 \
                  --keep-alive 2 \
                  --max-requests 1000 \
                  --max-requests-jitter 100 \
                  --access-logfile - \
                  --error-logfile - \
                  backend.wsgi:application
else
    echo "Starting development server..."
    exec python manage.py runserver 0.0.0.0:${PORT:-8000}
fi