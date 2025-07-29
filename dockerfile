FROM node:20.18.1-alpine as builder

WORKDIR /var/source
COPY package*.json ./
COPY prisma ./prisma/
COPY .env .env  
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build


FROM node:20.18.1-alpine
WORKDIR /var/source
COPY --from=builder /var/source/node_modules node_modules
COPY --from=builder /var/source/dist/src dist
COPY --from=builder /var/source/package.json .
COPY --from=builder /var/source/dist/prisma prisma
COPY --from=builder /var/source/.env .env   

EXPOSE 4000
CMD [ "npm", "run", "start:prod" ]
