FROM node:12-alpine

# Add package.json before rest of repo for caching
# install node modules
WORKDIR /usr/src/app
COPY package.json /usr/src/app/package.json
# 프로덕션을 위한 코드를 빌드하는 경우
# RUN npm ci --only=production
RUN npm install

# install application
COPY . /usr/src/app
# ENV NODE_ENV=production
EXPOSE 3000
CMD npm start