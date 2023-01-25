FROM node:19.2-alpine

WORKDIR /nutricookiebook_app

COPY package*.json /nutricookiebook_app

RUN npm i --silent
RUN npm i -g react-scripts@5.0.1

COPY . ./
