FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

# Aumentar a memória disponível para o Node.js
ENV NODE_OPTIONS=--max_old_space_size=4096

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 