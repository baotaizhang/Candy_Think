var _ = require('underscore');
var moment = require('moment');
var async = require('async');
var tools = require(__dirname + '/../util/tools.js')

var simulator = function(advisor, stream, logger){

    this.logger = logger;
    this.advisor = advisor;
    this.stream = stream;

    this.q = async.queue(function (task, callback) {
        this.logger.debug('Added ' + task.name + ' call to the queue.');
        this.logger.debug('There are currently ' + this.q.running() + ' running jobs and ' + this.q.length() + ' jobs in queue.');
        task.func(function() { 
            setTimeout(callback, 1000); 
        });
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

simulator.prototype.calculate = function(groupedBoards, balances, callback) {

    this.option.balance.krakenFee = balances[0].kraken.fee;
    this.option.balance.bitflyerFee = balances[1].bitflyer.fee * 100;

    var wrapper = function(finished){
        this.advisor.update(groupedBoards, this.option.balance, function(orders){
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

    this.stream.orderChart(order);

}

simulator.prototype.createOrder = function(order){

    if(order.result == 'SELL'){

        if(order.exchange == 'kraken'){

            this.option.balance.kraken_BTC = tools.round(this.option.balance.kraken_BTC + order.size * order.price, 8);
            this.option.balance.kraken_ETH = tools.round(this.option.balance.kraken_ETH - order.size, 8);

        }else if(order.exchange == 'bitflyer'){

            this.option.balance.bitflyer_BTC = tools.round(this.option.balance.bitflyer_BTC + order.size * order.price, 8);
            this.option.balance.bitflyer_ETH = tools.round(this.option.balance.bitflyer_ETH - order.size, 8);
        
        }

    }else if(order.result == 'BUY'){

        if(order.exchange == 'kraken'){

            this.option.balance.kraken_BTC = tools.round(this.option.balance.kraken_BTC - order.size * order.price, 8);
            this.option.balance.kraken_ETH = tools.round(this.option.balance.kraken_ETH + order.size, 8);

        }else if(order.exchange == 'bitflyer'){

            this.option.balance.bitflyer_BTC = tools.round(this.option.balance.bitflyer_BTC - order.size * order.price, 8);
            this.option.balance.bitflyer_ETH = tools.round(this.option.balance.bitflyer_ETH + order.size, 8);
        
        }

    }

    console.log(this.option.balance);
    return order;
        
};


module.exports = simulator;
