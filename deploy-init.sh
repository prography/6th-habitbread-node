#!/bin/bash
echo "NGINX init setting"
sudo cp -f ./nginx/conf.d/upstream.blue.conf ./nginx/conf.d/upstream.conf
docker exec -t node-nginx-lb service nginx reload

echo "FCM Message Queue Redis setting"
docker exec -t node-server-blue npx ts-node ./src/scripts/AddScheduleIntoRedisScript.ts

echo "Ranking Job Redis setting"
docker exec -t node-server-blue npx ts-node ./src/scripts/AddRankRedisScript.ts