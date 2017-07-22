var setting = {};

setting.systemPass = 'test/common/system/running';
setting.lineNotificationPass = '/common/system/line';
setting.orderFailedPass = 'test/trade/orderfailed';
setting.orderPass = 'test/think/order_1_NotYet/ETH_BTC/';
setting.balancePass = '/think/chart/balance/';

setting.space = 0.001;
setting.boardLimit = 1;

setting.currency = "BTC";
setting.asset = "ETH";
setting.pair = "ETH_BTC";

setting.bitflyer = {
    product_code : "ETH_BTC",
    currency : "BTC",
    asset : "ETH"
};

setting.kraken = {
    pair: 'XETHXXBT',
    currency: 'XXBT',
    asset: 'XETH'
};

setting.poloniex = {
    product_code : "BTC_ETH",
    currency : "BTC",
    asset : "ETH"
};

setting.profit = {
    'ETH_BTC' : {
        profit_percentage : 1.005,
        profit_sum : 0.0015
    }
};

setting.refresh = {
    'ETH_BTC' : {
        percentage_from : 1.0005,
        percentage_to : 1.005,
        bal_amt_percentage : 0.7,
        allocate : {
            ETH : {
                kraken : 0.5,
                bitflyer : 0.5
            },
            BTC : {
                kraken : 0.5,
                bitflyer : 0.5
            }
        }
    }
};

module.exports = setting;
