FROM node:14-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn

COPY . .

EXPOSE 5007

CMD ["yarn", "start"]