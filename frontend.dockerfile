FROM node:18-bullseye-slim

RUN apt-get update && DEBIAN_FRONTEND=noninteractive ACCEPT_EULA=Y apt-get install -y --fix-missing supervisor

WORKDIR /var/www

COPY /etc/timezone /etc/timezone:ro

COPY /etc/localtime /etc/localtime:ro

RUN DEBIAN_FRONTEND=noninteractive dpkg-reconfigure tzdata

ADD frontend-supervisor.conf /etc/supervisor/conf.d/frontend-supervisor.conf

RUN mkdir -p /var/log/supervisor

CMD /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
