FROM node:12-slim

# install node modules
# Add package.json before rest of repo for caching
WORKDIR /usr/src/app
COPY package.json /usr/src/app/package.json
# 프로덕션을 위한 코드를 빌드하는 경우
# RUN npm ci --only=production
RUN npm install

# install application
COPY . /usr/src/app
# CMD npm start
EXPOSE 80 3000