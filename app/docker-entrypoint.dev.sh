#!/bin/bash

echo "timezone Setting"
ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

echo "Waiting Docker Database ..."
dockerize -wait tcp://mysql-database:3306 -timeout 30s

echo "Apply Prisma generate"
ENV=${NODE_ENV} npm run prisma:generate

echo "Apply Prisma migrations"
ENV=${NODE_ENV} npm run prisma:up

echo "FCM Message Queue Redis setting"
npx ts-node ./src/scripts/AddScheduleIntoRedisScript.ts

echo "Ranking Job Redis setting"
npx ts-node ./src/scripts/AddRankRedisScript.ts