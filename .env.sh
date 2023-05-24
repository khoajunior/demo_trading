#! /bin/bash

export PORT=8000
export HOST=localhost
export NODE_ENV=local

# redis
export REDIS_PORT=6380
export REDIS_HOST=13.212.180.33
export REDIS_PASSWORD=redis_password

# tradermade 
export TRADERMADE_STREAMING_KEY=wsZYSF-3Z-ZGjAgJ9WVA
export TRADERMADE_WS_URL=wss://marketdata.tradermade.com/feedadv

# rabbit
export RABBIT_URL=amqp://admin:admin@13.212.180.33:5672

# hasura
export HASURA_ADMIN_SECRET=admin
export HASURA_URL=http://13.212.180.33:8095/v1/graphql

# KEYCLOAK
export USER_INFO_API_URL=http://13.212.180.33:8097/auth/realms/master/protocol/openid-connect/userinfo
export KEYCLOAK_USERNAME=minhchau
export KEYCLOAK_PASSWORD=minhchau2271994
export KEYCLOAK_REALM=master
export KEYCLOAK_CLIENT=hasura-keycloak-connector


# SOCKET_FOREX
export SOCKET_PORT=5001