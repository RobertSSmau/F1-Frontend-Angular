
FROM nginx:alpine
# Ultra-light Docker image for Angular 21 SPA
RUN rm -rf /usr/share/nginx/html/*
COPY dist/f1-frontend/browser/ /usr/share/nginx/html/
RUN ls -la /usr/share/nginx/html/

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN nginx -t

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]