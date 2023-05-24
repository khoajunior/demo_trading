module.exports = {

    EMIT_CREATE_ORDER: 'create:order',
    EMIT_UPDATE_ACTIVE_ORDER: 'update:active:order',
    EMIT_CLOSE_ACTIVE_ORDER: 'close:active:order',
    EMIT_GET_ORDER_LIST: 'order:list',
    EMIT_CLOSE_ACTIVE_ORDER_LIST: 'close:active:order:list',

    EMIT_UPDATE_PENDING_ORDER: 'update:pending:order',
    EMIT_CLOSE_PENDING_ORDER: 'close:pending:order',
    EMIT_CLOSE_PENDING_ORDER_LIST: 'close:pending:order:list',
    EMIT_DEMO_ACCOUNT: 'get:demo_account',

    EMIT_GET_PRICE: 'get:price',
    EMIT_CHART_REALTIME:'chart-realtime',
    EMIT_PIP_VALUE_AND_MARGIN: 'get:pip:margin',
    EMIT_COUNTER: 'get:counter',


    // SOCKET_URL: process.env.SOCKET_URL || 'http://,
    // SOCKET_URL: 'https://ws.merritrade.com',
     SOCKET_URL: process.env.SOCKET_URL || 'http://13.212.180.33:5005',
    // SOCKET_URL: process.env.SOCKET_URL || 'http://localhost:5008',
   
    ACCESS_TOKEN: process.env.ACCESS_TOKEN || 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkWXJmTEk4UDZPWmFYeWt3aWtCc1Vncmc1RDA1d3hwNWZ3VHFmaXBPQnY0In0.eyJleHAiOjE2MjQ2MzkyOTcsImlhdCI6MTYyNDYwMzI5NywianRpIjoiZTUyNWExNGYtODU3MS00MzVjLTk3YTUtZTc4MTMxNDBiZWM3IiwiaXNzIjoiaHR0cDovLzU0LjI1NS4xNzUuMTE2OjgwOTcvYXV0aC9yZWFsbXMvbWFzdGVyIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjMwMjM5ZDViLTY1ZDEtNGFhZi1hY2FhLTU5MzUyY2JhODY5ZCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImNsaWVudCIsInNlc3Npb25fc3RhdGUiOiI4ZTBkNjQ3Ni1hZjNmLTQwNDQtYjEzMC1jMTNkZTAwNmE2OTgiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtbWFzdGVyIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImNsaWVudCI6eyJyb2xlcyI6WyJhZG1pbiJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6InVzZXJuYW1lLXRlc3QiLCJlbWFpbCI6Im5ncGhvbmcxOTk4QGdtYWlsLmNvbSJ9.RQ7HeBz5dLW6aOY73sSiEWGOG1R-2Xw-hHWLoXUPUqnMZqVGV3pNM0ck8PSj8h5W8HEl6W7FNrQDQWKrGgcuX0ehAvl5RGww_f0eJ_j9u-SV2Z5wjpYEA60XiVREgH70WKsroI9bvwFzgtyZlVEy7kEwhSr89khz7fjL_9qXjvJX7nt_pacBQ_ELlJRtCcgU6tmGhRH51sb7RYB26Kpbab5GJ_AUQEcaMikKQHOWYZ4Z2WekFD0UkcYK9c5tHIYxBgJKOSoszSVLe3eOWE1rOz5osdZ_1WmFLelKQChie1u2Wz3OFc0nHpOlEhxf5n9lXx-UYgRTFcvTQ9z8cAehqw',

    //NAME_SPACE
    NAME_SPACE_FOREX: '/forex',
    NAME_SPACE_FOREX_ACTIVE: '/forex-active',
    NAME_SPACE_FOREX_PENDING: '/forex-pending',
    NAME_SPACE_PRICE_DETAIL: '/price-detail',

    // forex
    // status
    STATUS_PENDING: 2,
    STATUS_ACTIVE: 3,
    STATUS_CLOSE: 4,
    STATUS_CANCEL: 5,

}
