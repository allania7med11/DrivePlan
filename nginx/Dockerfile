FROM nginx:alpine

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy built static assets
COPY backend/staticfiles/ /var/www/backend_static/
COPY frontend/out/ /var/www/frontend/

EXPOSE 80