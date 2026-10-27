# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production Stage with Nginx
FROM nginx:alpine

# Copy built assets to Nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
