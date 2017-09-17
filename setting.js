var setting = {};
var env = process.argv[2];

setting.systemPass = env + '/common/system/running';
setting.lineNotificationPass = env + '/common/system/line';
setting.orderFailedPass = env + '/trade/orderfailed';
setting.orderPass = env + '/think/order';
setting.balancePass = env + '/think/chart/balance/';
setting.statusPass = env + '/common/system/tradestatus'
setting.requestPass = env + '/common/system/Request/'
setting.profitPass = env + '/think/chart/profit/';
setting.orderCompletionPass = env + '/common/system/orderstatus';

setting.space = 0.001;
setting.boardLimit = 1;

setting.pairs = ["BTC_USD", "ETH_BTC"];
setting.action = ["think", "refresh"];

setting.BTC_USD = {
    currency : "BTC",
    asset : "USD",
    pair : "BTC_USD",
    bitflyer : {
        product_code : "BTC_JPY",
        currency : "BTC",
        asset : "JPY",
        format : "USDJPY"
    },
    kraken : {
        pair: 'XXBTZUSD',
        currency: 'XXBT',
        asset: 'ZUSD'
    },
    poloniex : {
        pair : "USDT_BTC",
        currency : "BTC",
        asset : "USDT"
    }
}

setting.ETH_BTC = {
    currency : "ETH",
    asset : "BTC",
    pair : "ETH_BTC",
    bitflyer : {
        product_code : "ETH_BTC",
        currency : "BTC",
        asset : "ETH"
    },
    kraken : {
        pair: 'XETHXXBT',
        currency: 'XXBT',
        asset: 'XETH'
    },
    poloniex : {
        pair : "BTC_ETH",
        currency : "ETH",
        asset : "BTC"
    }
}

setting.profit = {
    'BTC_USD' : {
        profit_percentage : 1.008,
        profit_sum : 0.0015
    },
    'ETH_BTC' : {
        profit_percentage : 1.008,
        profit_sum : 0.0015
    }
};

setting.refresh = {
    'BTC_USD' : {
        percentage_from : 1.0005,
        percentage_to : 1.005,
        bal_amt_percentage : 0.7,
        allocate : {
            USD : {
                kraken : 0.3,
                bitflyer : 0.4,
                poloniex : 0.3
            },
            BTC : {
                kraken : 0.3,
                bitflyer : 0.4,
                poloniex : 0.3
            }
        }
    },
    'ETH_BTC' : {
        percentage_from : 1.0005,
        percentage_to : 1.005,
        bal_amt_percentage : 0.7,
        allocate : {
            ETH : {
                kraken : 0.3,
                bitflyer : 0.4,
                poloniex : 0.3
            },
            BTC : {
                kraken : 0.3,
                bitflyer : 0.4,
                poloniex : 0.3
            }
        }
    }
};

setting.minimumtrade = {
    poloniex : 0.0001,
    kraken : 0.01,
    bitflyer : 0.01
}

module.exports = setting;
