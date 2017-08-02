var setting = {};

setting.systemPass = '/test/common/system/running';
setting.lineNotificationPass = '/test/common/system/line';
setting.orderFailedPass = '/test/trade/orderfailed';
setting.orderPass = '/test/think/order_1_NotYet/ETH_BTC/';
setting.balancePass = '/test/think/chart/balance/';
setting.statusPass = '/test/common/system/tradestatus'

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
    pair : "BTC_ETH",
    currency : "BTC",
    asset : "ETH"
};

setting.profit = {
    'ETH_BTC' : {
        profit_percentage : 1.008,
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
