docker build -t ws-server ./microservices/ws_server
docker build -t data-forex-binary-pg ./microservices/data-forex-binary-pg
docker build -t data-demo-account-redis ./microservices/data-demo-account-redis
docker build -t logic-binary ./microservices/logic-binary
docker build -t logic-active ./microservices/logic-active-forex
docker build -t logic-pending ./microservices/logic-pending-forex
docker build -t logic-margin ./microservices/logic-margin-forex
