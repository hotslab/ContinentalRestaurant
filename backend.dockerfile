FROM node:18-bullseye-slim

RUN apt-get update && DEBIAN_FRONTEND=noninteractive ACCEPT_EULA=Y apt-get install -y --fix-missing supervisor redis-server

WORKDIR /var/www

ADD backend-supervisor.conf /etc/supervisor/conf.d/backend-supervisor.conf

RUN mkdir -p /var/log/supervisor

ADD backend-supervisor.conf /etc/supervisor/conf.d/backend-supervisor.conf

# RUN DEBIAN_FRONTEND=noninteractive dpkg-reconfigure tzdata

CMD /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
