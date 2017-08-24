var setting = {};
var env = process.argv[2];

setting.systemPass = env + '/common/system/running';
setting.lineNotificationPass = env + '/common/system/line';
setting.orderFailedPass = env + '/trade/orderfailed';
setting.orderPass = env + '/think/order';
setting.balancePass = env + '/think/chart/balance/';
setting.statusPass = env + '/common/system/tradestatus'
setting.requestPass = env + '/common/system/Request/'

setting.space = 0.001;
setting.boardLimit = 1;

setting.currency = "BTC";
setting.asset = "USD";
setting.pair = "BTC_USD";

setting.bitflyer = {
    product_code : "BTC_JPY",
    currency : "BTC",
    asset : "JPY"
};

setting.kraken = {
    pair: 'XXBTZUSD',
    currency: 'XXBT',
    asset: 'ZUSD'
};

setting.poloniex = {
    pair : "USDT_BTC",
    currency : "BTC",
    asset : "USDT"
};

setting.profit = {
    'BTC_USD' : {
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
    }
};

setting.minimumtrade = {
    poloniex : 0.0001,
    kraken : 0.01,
    bitflyer : 0.01
}

module.exports = setting;
