#!/bin/bash

dockerize -wait tcp://mysql-database:3306 -timeout 10s

# Apply prisma generate
echo "Apply Prisma generate"  
ENV=${NODE_ENV} npm run prisma:generate

# Apply prisma migrations
echo "Apply Prisma migrations"  
ENV=${NODE_ENV} npm run prisma:up

# Running Alarm Scheduler
echo "Running Alarm Scheduler"
npx ts-node ./src/scripts/AddScheduleIntoRedis.ts

# Run Server
echo "Run Server !"
npm start