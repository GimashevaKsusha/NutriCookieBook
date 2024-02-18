FROM node:19-alpine

WORKDIR /nutricookiebook_app

COPY package*.json /nutricookiebook_app

RUN npm ci --silent
RUN npm i -g react-scripts@5.0.1 serve

COPY . ./

RUN npm run build
