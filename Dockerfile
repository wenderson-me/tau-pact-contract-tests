FROM node:20-slim

RUN apt-get update && apt-get install -y python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN mkdir -p __tests__/contract/logs __tests__/contract/pacts

EXPOSE 8081 8082 8083
CMD ["npm", "test"]
