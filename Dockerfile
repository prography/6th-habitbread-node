FROM node:12

ARG APP_PATH=/usr/src/app

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

# docker-compose CMD more priority than this
CMD [ "npm", "start" ]