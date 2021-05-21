FROM node:14-alpine

WORKDIR /app

ADD package.json .
ADD package-lock.json .
RUN npm install -g npm
RUN npm install
ADD db.json .
ADD main.js .

EXPOSE 80
ENTRYPOINT ["npm", "start"]
CMD []
