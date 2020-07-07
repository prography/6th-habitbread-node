FROM node:12

ARG APP_PATH=/usr/src/app
ARG DOCKERIZE_VERSION=v0.2.0

# dockerize 설치 명령어
RUN wget https://github.com/jwilder/dockerize/releases/download/${DOCKERIZE_VERSION}/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \  
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

# install node modules
# Add package.json before rest of repo for caching
WORKDIR ${APP_PATH}
COPY package.json ${APP_PATH}/package.json

# For Deploy production codes
# RUN npm ci --only=production
RUN npm install

# install application
COPY . ${APP_PATH}

EXPOSE 80 3000

# # docker-compose 'command' more priority than this
CMD [ "npm", "start" ]