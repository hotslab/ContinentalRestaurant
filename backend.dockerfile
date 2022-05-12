FROM node:18-bullseye-slim

RUN apt-get update && DEBIAN_FRONTEND=noninteractive ACCEPT_EULA=Y apt-get install -y --fix-missing supervisor \
    redis-server \
    curl \
    nano

RUN apt-get update && DEBIAN_FRONTEND=noninteractive ACCEPT_EULA=Y apt-get install -y --fix-missing libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \ 
    libxtst6 \
    xauth  \
    xvfb \
    # for closing start-server npm package in testing using cypress
    procps  

# for cypress installation
RUN mkdir /root/.cache
RUN mkdir /root/.cache/Cypress
RUN chown node:node -R /root/

WORKDIR /var/www

COPY backend.env ./.env
COPY ./backend/package*.json ./
RUN npm i
COPY ./backend ./

ADD backend-supervisor.conf /etc/supervisor/conf.d/backend-supervisor.conf

RUN mkdir -p /var/log/supervisor

CMD /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
