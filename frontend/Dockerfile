FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Use nginx unprivileged image - designed for non-root / OpenShift
FROM nginxinc/nginx-unprivileged:1.25-alpine

# Copy built React app and our custom config
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port 8080 - non-root nginx (OpenShift won't allow 80)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
