FROM node:18-bullseye-slim

RUN apt-get update && DEBIAN_FRONTEND=noninteractive ACCEPT_EULA=Y apt-get install -y --fix-missing supervisor \
    redis-server \
    xvfb \
    libglib2.0-0 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libgtk-3-0 \
    libgbm-dev

# for cypress
RUN mkdir /root/.cache/Cypress

RUN chown -R node:node /root/.cache/Cypress

WORKDIR /var/www

ADD backend-supervisor.conf /etc/supervisor/conf.d/backend-supervisor.conf

RUN mkdir -p /var/log/supervisor

ADD backend-supervisor.conf /etc/supervisor/conf.d/backend-supervisor.conf

# RUN DEBIAN_FRONTEND=noninteractive dpkg-reconfigure tzdata

CMD /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
