FROM node:slim

WORKDIR battleship

COPY routes routes
COPY views views 
COPY public public
COPY *.js ./
COPY *.json ./

RUN npm install

ENTRYPOINT ["node"]
CMD ["app.js"]

EXPOSE 3000

