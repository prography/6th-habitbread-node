#!/bin/bash

dockerize -wait tcp://mysql-database:3306 -timeout 10s

# Apply prisma generate
echo "Apply Prisma generate"  
ENV=${NODE_ENV} npm run prisma:generate

# Apply prisma migrations
echo "Apply Prisma migrations"  
ENV=${NODE_ENV} npm run prisma:up

# Run server from pm2 script
pm2-runtime start pm2.config.json