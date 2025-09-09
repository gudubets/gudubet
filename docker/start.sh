#!/bin/sh

# Start script for production container

echo "Starting Casino Platform..."

# Check if all required environment variables are set
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "Error: VITE_SUPABASE_URL environment variable is not set"
    exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "Error: VITE_SUPABASE_ANON_KEY environment variable is not set"
    exit 1
fi

# Set proper file permissions
find /usr/share/nginx/html -type f -exec chmod 644 {} \;
find /usr/share/nginx/html -type d -exec chmod 755 {} \;

# Start nginx
echo "Starting nginx..."
exec nginx -g 'daemon off;'