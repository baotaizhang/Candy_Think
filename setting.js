var setting = {};

setting.exchanges = {
    bitflyer : 'test/crypto/bitflyer/v1/getboard/ETH_BTC/board',
    kraken : 'test/crypto/kraken/0/public/Depth/XETHXXBT'
};

setting.orderFailedPass = 'test/trade/orderfailed';

setting.space = 0.001;

setting.currency = "BTC";
setting.asset = "ETH";
setting.pair = "BTC_ETH";

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

setting.profit = {
    'ETH_BTC' : {
        profit_percentage : 1.005,
        profit_sum : 0.001
    }
};

module.exports = setting;
