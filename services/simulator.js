var _ = require('underscore');
var moment = require('moment');
var async = require('async');

var simulator = function(advisor, logger){

    this.logger = logger;
    this.advisor = advisor;

    this.options = {};

    this.options.balance = {

        craken_BTC : 10000000,
        craken_ETH : 10000000,
        bitflyer_BTC : 10000000,
        bitflyer_ETH : 10000000

    };

  _.bindAll(this, 'calculate', 'createOrder');

};

simulator.prototype.calculate = function(groupedBoards, callback) {

    var result = this.advisor.update(groupedBoards, this.options.balance);

};



simulator.prototype.createOrder = function(advice, callback){

    advice.orders.forEach(function(order){
        
        if(order.result == 'sell'){

            if(order.exchange == 'craken'){

                this.option.balance.craken_BTC = this.option.balance.craken_BTC - order.price;
                this.option.balance.craken_ETH = this.option.balance.craken_ETH - order.size;

            }else if(order.exchange == 'bitflyer'){

                this.option.balance.bitflyer_BTC = this.option.balance.bitflyer_BTC - order.price;
        
            }

        }else if(order.result == 'buy'){

            if(order.exchange == 'craken'){

                this.option.balance.craken_BTC = this.option.balance.craken_BTC + order.price;

            }else if(order.exchange == 'bitflyer'){

                this.option.balance.bitflyer_BTC = this.option.balance.bitflyer_BTC + order.price;
        
            }

        }
        
    });
    
    callback();

};


module.exports = simulator;
