#!/bin/bash

echo "Waiting Docker Database ..."
dockerize -wait tcp://mysql-database:3306 -timeout 10s

echo "Apply Prisma generate"
ENV=${NODE_ENV} npm run prisma:generate

echo "Apply Prisma migrations"
ENV=${NODE_ENV} npm run prisma:up

echo "FCM Message Queue Redis setting"
npx ts-node ./src/scripts/AddScheduleIntoRedisScript.ts

echo "Ranking Job Redis setting"
npx ts-node ./src/scripts/AddRankRedisScript.ts