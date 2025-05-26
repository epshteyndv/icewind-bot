FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . .
RUN npm run build

WORKDIR /app/dist

EXPOSE 3000
CMD ["node", "index.js"]