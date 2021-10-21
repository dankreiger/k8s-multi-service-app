FROM node:17-slim

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

CMD [ "npm", "run", "dev" ]