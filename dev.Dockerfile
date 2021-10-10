# -------------- STAGE 1: Build --------------

FROM node:14.17.0-alpine as builder
LABEL maintainer="Pantelis Eleftheriadis"

# set working directory
WORKDIR /frontend
# add `/frontend/node_modules/.bin` to $PATH
ENV PATH /frontend/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /frontend/package.json
RUN npm install
RUN npm install -g @angular/cli@12.0.0
# add app
COPY . /frontend


# -------------- STAGE 2: Run --------------

CMD npm run start_headless
