var setting = {};

setting.exchanges = {
    bitflyer : '/crypto/bitflyer/v1/getboard/ETH_BTC/board',
    kraken : '/crypto/kraken/0/public/Depth/XETHXXBT'
    // poloniex : '/crypto/poloniex/public/poloniexOrderBooks/BTC_ETH/boards'
};

setting.systemPass = 'common/system/running';
setting.lineNotificationPass = 'common/system/line';
setting.orderFailedPass = '/trade/orderfailed';
setting.orderPass = 'think/order_1_NotYet/ETH_BTC/';
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

module.exports = setting;
