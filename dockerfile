# Build stage
FROM node:18-alpine AS build

# Build backend
WORKDIR /server

COPY ./server .
RUN npm install --include=dev
RUN npm run build

# Build frontend
WORKDIR /client

COPY ./client .
RUN npm install --include=dev
RUN npm run build

# Publish stage
FROM node:18-alpine
WORKDIR /app

COPY --from=build /server/dist .
COPY --from=build /server/node_modules  ./node_modules 
COPY --from=build /client/dist ./wwwroot

EXPOSE 3000
CMD ["node", "index.js"]