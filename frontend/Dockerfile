# frontend/Dockerfile
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . ./
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html

# optional: copy own nginx.conf for proxy to backend
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
