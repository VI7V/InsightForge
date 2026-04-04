FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
ARG REACT_APP_GRAPHQL_URL=http://localhost:4000/graphql
ENV REACT_APP_GRAPHQL_URL=$REACT_APP_GRAPHQL_URL
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/build /usr/share/nginx/html
RUN echo 'server{listen 80;location/{root /usr/share/nginx/html;index index.html;try_files $uri $uri/ /index.html;}}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
