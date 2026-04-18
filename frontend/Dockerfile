FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
# Install dependencies automatically and run the frontend server
CMD sh -c "npm install && npm run dev -- --host 0.0.0.0 --port 3000"
