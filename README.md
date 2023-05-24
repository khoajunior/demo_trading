# DEPLOY
1. docker-compose-keycloak.yml  => create keycloak
2. docker-compose-core.yml  => create redis and rabbit
3. docker-compose.yml => create api(hasura)
4. docker-compose-socket => create socket server and socket client
5. docker-compose-logic-data => create handle logic and handle data

6. deploy docker-compose-price-poligon.yml in server with docker-compose-socket.yml production.



trading_key
wsyfzSNQSoancvb_W6Vg
wsQl634VQdkBVXh2aHMw
wsyYpM4uZ2dyOZFUm89Q
wsMoowtgoAG6dbDM0Euw

## all data update to data-forex-binary

# local
source ./.env.sh


## config keycloak
sudo docker exec -it <container-db-keycloak> /bin/sh
    -> sudo docker exec -it trading-keycloak-db /bin/sh
# and then execute
psql -U <dbuser> -d <dbname> //minhchau; keycloak-db
keycloak=# update realm set ssl_required='NONE';

ubuntu server: password: trading

RUN FILE .ENV.SH => source .env.sh


### Validate value item socketIO


// test ws in forex run in local 
open order_forex and test_forex


// test ws in auto update
docker: 
local test_forex _> 5005

?? front_end
?/ banck_end = microservice 


# fix TODO + .env(HASURA_URL) + docker-compose(bỏ 1)

# Sửa: online_margin: controller,support query,app 

# nhớ bật check auth lại trong order_forex


# Time const date = new Date().toISOString().replace('Z', '+00:00')


ASSET_LIST: [
        'USDJPY', 'EURUSD', 'USDMXN', 'GBPUSD', 'EURMXN', 'USDCHF', 'USDPLN', 'USDCAD', 'EURPLN', 'AUDUSD',
        'USDTRY', 'NZDUSD', 'EURTRY', 'EURGBP', 'EURJPY', 'USDCNH', 'EURCHF', 'USDHKD', 'EURAUD', 'USDSGD',
        'EURCAD', 'SGDJPY', 'EURNZD', 'USDHUF', 'GBPJPY', 'EURHUF', 'GBPCHF', 'USDZAR', 'BTCJPY', 'BTCUSD',
        'GBPCAD', 'EURZAR', 'BTCEUR', 'GBPAUD', 'ETHUSD', 'GBPNZD', 'ZARJPY', 'LTCUSD', 'NZDJPY', 'USDSEK',
        'XAUUSD', 'XRPUSD', 'NZDCAD', 'EURSEK', 'XAGUSD', 'NZDCHF', 'USDNOK', 'XAUEUR', 'AUDJPY', 'EURNOK',
        'XAGEUR', 'AUDCAD', 'XPTUSD', 'AUDCHF', 'EURDKK', 'XPDUSD', 'AUDNZD', 'NOKSEK', 'CADJPY', 'NOKJPY',
        'CADCHF', 'USDRUB'
    ],
    
//Input: user_id,tournament_id
module.exports = async(req, res) => {
    console.log(`API `)
    try {
        const item=req.body

        
        return res.json({ status: 200, message: 'Handle success', data:  })
    } catch (err) {
        return res.json({ status: 400, message: err.message, data: null })
    }
}


## example redis order 
await redis_db.zaddAsync("EUR/USD:TP", "1","12:1")
const order_result = await redis_db.zscoreAsync("EUR/USD:TP", "12:1")
console.log({order_result})
const compare_order = await redis_db.zrangebyscoreAsync('EUR/USD:TP', "[10", "[20")
console.log({compare_order})



## redis, rabbit in 2 server
IP:
  54.179.160.37 
  13.212.180.33


create total_margin

CREATE OR REPLACE FUNCTION public.total_margin(demo_account_row demo_account)
 RETURNS double precision
 LANGUAGE sql
 STABLE
AS $function$
  SELECT sum(margin)
    FROM demo_history_forex as df
    WHERE demo_account_row.user_id = df.user_id and df.tournament_id = demo_account_row.tournament_id and df.status = 3
    group by df.tournament_id, df.user_id

$function$


total_net_profit_loss
CREATE OR REPLACE FUNCTION public.total_profit_loss(demo_account_row demo_account)
 RETURNS SETOF demo_history_forex
 LANGUAGE sql
 STABLE
AS $function$
  SELECT *
    FROM demo_history_forex as df
    WHERE demo_account_row.user_id = df.user_id and df.tournament_id = demo_account_row.tournament_id and df.status = 3

$function$

redis
fx-tournament-001.ilsrix.0001.apse1.cache.amazonaws.com

redis forward
ssh -f -N -L 6387:10.0.2.139:6379 deploy@18.140.247.170

OBJECT_PIP_VALUE: {
        //Crypto
        "BTC-USD": { pip_value: 1, base_pip: 1, amount: 1 },
        "ETH-USD": { pip_value: 1, base_pip: 1, amount: 1 },
        "BCH-USD": { pip_value: 1, base_pip: 1, amount: 1 },
        "LTC-USD": { pip_value: 1, base_pip: 1, amount: 1 },
        "XRP-USD": { pip_value: 0.001, base_pip: 0.001, amount: 1 },

        //Commodity
        "XAU/USD": { pip_value: 10, base_pip: 0.1, amount: 100 },
        // "XAG/USD": { pip_value: 5, base_pip: 0.001, amount: 5000 }
        "XAG/USD": { pip_value: 50, base_pip: 0.01, amount: 5000 }, // pip in bac 
        "WTICO/USD": { pip_value: 10, base_pip: 0.01, amount: 1000 },
        "BCO/USD": { pip_value: 10, base_pip: 0.01, amount: 1000 },
    }


    pip value
    https://www.exness.com/calculator/
 
    https://www.ifcmarkets.com/en/trading-conditions/commodities/oil

// node 
create env: 

// create derectory for save requirement
pip install virtualenv
virtualenv mypython
source mypython/bin/activate

create requirements.txt
pip freeze > requirements.txt

// install vo env
pip3 install -r requirements.txt
