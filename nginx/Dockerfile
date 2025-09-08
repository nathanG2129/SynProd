# Nginx Dockerfile for SynProd frontend serving and API proxy
FROM nginx:1.25-alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create necessary directories
RUN mkdir -p /var/log/nginx && \
    mkdir -p /usr/share/nginx/html

# Copy frontend build files (will be mounted in docker-compose)
# The frontend files will be copied from the build process

# Set proper permissions (nginx user already exists in base image)
RUN chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
