# -------------- STAGE 1: Build --------------

FROM node:14.17.0-alpine as builder
LABEL maintainer="Pantelis Eleftheriadis"

# set working directory
WORKDIR /frontend
# add `/frontend/node_modules/.bin` to $PATH
ENV PATH /frontend/node_modules/.bin:$PATH

# install and cache frontend dependencies
COPY package.json /frontend/package.json
RUN npm install

# add frontend source
COPY . /frontend

## Build the angular app in production mode
RUN npm run build-prod

# -------------- STAGE 2: Run --------------
# Serve wuth nginx server
FROM nginx:1.20.1-alpine
LABEL maintainer="Pantelis Eleftheriadis"

## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From ‘builder’ stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /frontend/dist/data-rep-angular-material /usr/share/nginx/html

# Expose port 80
EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]
