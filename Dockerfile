FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Expose API port
EXPOSE 3000

# Default command (can be overridden in docker-compose)
CMD ["npm", "start"]
