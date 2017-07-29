var setting = {};

setting.systemPass = 'test/common/system/running';
setting.lineNotificationPass = 'test/common/system/line';
setting.orderFailedPass = 'test/trade/orderfailed';
setting.orderPass = 'test/think/order_1_NotYet/ETH_BTC/';
setting.balancePass = '/think/chart/balance/';
setting.statusPass = 'test/common/system/tradestatus'

setting.space = 0.001;
setting.boardLimit = 1;

setting.currency = {
    kraken : "BTC",
    bitflyer : "BTC",
    poloniex : "BTC"
};

setting.asset = {
    kraken : "USD",
    bitflyer : "JPY",
    poloniex : "USD"
};
setting.pair = {
    kraken : "USD_BTC",
    bitflyer : "JPY_BTC",
    poloniex : "USD_BTC"
};

setting.bitflyer = {
    product_code : "JPY_BTC",
    currency : "BTC",
    asset : "JPY"
};

setting.kraken = {
    pair: 'XXBTXUSD',
    currency: 'XXBT',
    asset: 'XUSD'
};

setting.poloniex = {
    product_code : "BTC_USD",
    currency : "BTC",
    asset : "USD"
};

setting.profit = {
    'FIAT_BTC' : {
        profit_percentage : 1.005,
        profit_sum : 0.0015
    }
};

setting.refresh = {
    'FIAT_BTC' : {
        percentage_from : 1.0005,
        percentage_to : 1.005,
        bal_amt_percentage : 0.7,
        allocate : {
            FIAT : {
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

module.exports = setting;
