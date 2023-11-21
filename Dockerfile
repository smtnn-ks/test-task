FROM node:lts-alpine3.16

WORKDIR /usr/src/app

EXPOSE 80:80

COPY package*.json ./

RUN npm install 

COPY . . 

RUN npm run build 

CMD [ "npm", "start"]
