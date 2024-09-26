FROM nginx:1.21.3-alpine
ADD ./dist/ /usr/share/nginx/html
