#!/bin/sh
# Generate nginx.conf from template with environment variables
envsubst '${FRONTEND_URL} ${FRONTEND_HOST}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Start nginx
nginx -g 'daemon off;'