# Dockerfile
FROM node:16

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

# Install all dependencies (including dev dependencies like nodemon)
RUN npm install

COPY . /app

EXPOSE 3001

CMD ["npm", "start"]
