FROM node:18-bullseye-slim

RUN apt-get update && DEBIAN_FRONTEND=noninteractive ACCEPT_EULA=Y apt-get install -y --fix-missing supervisor curl nano
RUN npm i -g @quasar/cli

WORKDIR /var/www

COPY ./frontend/package*.json ./

RUN npm i

COPY ./frontend ./

RUN quasar build -m spa

ADD frontend-supervisor.conf /etc/supervisor/conf.d/frontend-supervisor.conf

RUN mkdir -p /var/log/supervisor

CMD /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
