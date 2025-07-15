FROM nginx:alpine

# Copy template and startup script
COPY nginx/nginx.conf.template /etc/nginx/nginx.conf.template
COPY nginx/run.sh /run.sh
RUN chmod +x /run.sh

EXPOSE 80
CMD ["/run.sh"]