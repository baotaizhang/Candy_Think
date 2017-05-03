var _ = require('underscore');
var moment = require('moment');
var async = require('async');

var simulator = function(advisor, logger){

    this.logger = logger;
    this.advisor = advisor;
    this.q = async.queue(function (task, callback) {
        this.logger.debug('Added ' + task.name + ' call to the queue.');
        this.logger.debug('There are currently ' + this.q.running() + ' running jobs and ' + this.q.length() + ' jobs in queue.');
        task.func(function() { setTimeout(callback, 2000); });
    }.bind(this), 1);

    this.option = {};

    this.option.balance = {

        kraken_BTC : 10000000,
        kraken_ETH : 10000000,
        bitflyer_BTC : 10000000,
        bitflyer_ETH : 10000000

    };

  _.bindAll(this, 'calculate', 'createOrder');

};

simulator.prototype.calculate = function(groupedBoards, callback) {

    var wrapper = function(finished){
        this.advisor.update(groupedBoards, this.option.balance, function(orders){
            console.log(orders);

            orders.forEach(function(order){
                if(order.result) {
                    console.log(order);
                    callback(this.createOrder(order));
                } else {
                    var err = 'Invalid advice from indicator, should be either: buy or sell.';
                    console.log(err);
                }
            }.bind(this));

            finished();

        }.bind(this));
    }.bind(this);

    this.q.push({name: 'calculate', func: wrapper});
};

simulator.prototype.firebaseReport = function(order){


}

simulator.prototype.createOrder = function(order){

    if(order.result == 'SELL'){

        if(order.exchange == 'kraken'){

            this.option.balance.kraken_BTC = this.option.balance.kraken_BTC - order.size;
            this.option.balance.kraken_ETH = this.option.balance.kraken_ETH + order.price;

        }else if(order.exchange == 'bitflyer'){

            this.option.balance.bitflyer_BTC = this.option.balance.bitflyer_BTC - order.size;
            this.option.balance.bitflyer_ETH = this.option.balance.bitflyer_ETH + order.price;
        
        }

    }else if(order.result == 'BUY'){

        if(order.exchange == 'kraken'){

            this.option.balance.kraken_BTC = this.option.balance.kraken_BTC + order.size;
            this.option.balance.kraken_ETH = this.option.balance.kraken_ETH - order.price;

        }else if(order.exchange == 'bitflyer'){

            this.option.balance.bitflyer_BTC = this.option.balance.bitflyer_BTC + order.size;
            this.option.balance.bitflyer_ETH = this.option.balance.bitflyer_ETH - order.price;
        
        }

    }

    console.log(this.option.balance);
    return order;
        
};


module.exports = simulator;
