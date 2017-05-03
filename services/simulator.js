var _ = require('underscore');
var moment = require('moment');
var async = require('async');

var simulator = function(advisor, logger){

    this.logger = logger;
    this.advisor = advisor;

    this.options = {};

    this.options.balance = {

        kraken_BTC : 10000000,
        kraken_ETH : 10000000,
        bitflyer_BTC : 10000000,
        bitflyer_ETH : 10000000

    };

  _.bindAll(this, 'calculate', 'createOrder');

};

simulator.prototype.calculate = function(groupedBoards, callback) {

    async.waterfall([
        function(next){
            var orders = this.advisor.update(groupedBoards, this.options.balance);
            next(null, orders);
        }.bind(this),
        function(orders, next){
            orders.forEach(function(order){
                if(order.result) {
                    console.log(order);
                    this.createOrder(order);
                } else {
                    var err = 'Invalid advice from indicator, should be either: buy or sell.';
                    console.log(err);
                }
            });
            next(null, orders);
        }.bind(this),
        function(orders, next){
            orders.forEach(function(order){
                if(order.result) {
                    console.log(order);
                    callback(order);
                } else {
                    var err = 'Invalid advice from indicator, should be either: buy or sell.';
                    console.log(err);
                }
            });
            next();
        }],
        function(err){
            console.log(err);
        }
    );
};

simulator.prototype.firebaseReport = function(order){


}

simulator.prototype.createOrder = function(order){

    if(order.result == 'sell'){

        if(order.exchange == 'kraken'){

            this.option.balance.craken_BTC = this.option.balance.kraken_BTC - order.size;
            this.option.balance.craken_ETH = this.option.balance.kraken_ETH + order.price;

        }else if(order.exchange == 'bitflyer'){

            this.option.balance.bitflyer_BTC = this.option.balance.bitflyer_BTC - order.size;
            this.option.balance.craken_ETH = this.option.balance.bitflyer_ETH + order.price;
        
        }

    }else if(order.result == 'buy'){

        if(order.exchange == 'kraken'){

            this.option.balance.craken_BTC = this.option.balance.kraken_BTC + order.size;
            this.option.balance.craken_ETH = this.option.balance.kraken_ETH - order.price;

        }else if(order.exchange == 'bitflyer'){

            this.option.balance.bitflyer_BTC = this.option.balance.bitflyer_BTC + order.size;
            this.option.balance.craken_ETH = this.option.balance.bitflyer_ETH - order.price;
        
        }

    }

    console.log(JSON.stringify(this.option.balance));
    return order;
        
};


module.exports = simulator;
