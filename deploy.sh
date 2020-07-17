#!/bin/bash

main() {
  BLUE_SERVER="http://localhost:3000"
  GREEN_SERVER="http://localhost:4000"

  BLUE=$(curl -s $BLUE_SERVER)
  GREEN=$(curl -s $GREEN_SERVER)

  if [ -z "$BLUE" ]
  then
    echo "Changing Green -> Blue Server"
    sudo cp -f ./nginx/conf.d/upstream.blue.conf ./nginx/conf.d/upstream.conf
    docker-compose -f docker-compose.blue.yml up -d

    # wait
    wait_server $BLUE_SERVER

    docker exec -t node-nginx-lb service nginx reload
    docker-compose -f docker-compose.green.yml down
  else
    echo "Changing Blue -> Green Server"
    sudo cp -f ./nginx/conf.d/upstream.green.conf ./nginx/conf.d/upstream.conf
    docker-compose -f docker-compose.green.yml up -d

    # wait
    wait_server $GREEN_SERVER

    docker exec -t node-nginx-lb service nginx reload
    docker-compose -f docker-compose.blue.yml down
  fi
}

# 서버 올라갈 때 까지 wait하는 함수
function wait_server() {
  SERVER_URL=$1
  max_iterations=15
  iterations=1

  while true; do
    echo "Attempt $iterations"
    sleep 5

    http_code=$(curl -s -o /dev/null -w '%{http_code}' $SERVER_URL)
    if [ $http_code -eq 200 ]; then # ==
      echo "Server Up"; break;
    fi

    if [ $iterations -ge $max_iterations ]; then # >=
      echo "Loop Timeout"; exit 1;
    fi
    ((iterations++))
  done
}

# 메인 함수 실행
main