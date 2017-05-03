var _ = require('underscore');
var async = require('async');
var candyThinkOBJ = require(__dirname + '/../indicator/candyThink.js');

var candyThink = new candyThinkOBJ();

var advisor = function(logger) {

    this.logger = logger;
    this.indicator = candyThink;

  _.bindAll(this, 'update');

};

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(advisor, EventEmitter);
//---EventEmitter Setup

advisor.prototype.update = function(groupedBoards, balance) {

    // convert data with candyThink way.
    // ******************************************************************
    var candyThinkBalance = [ 
        {
            exchange_type:1,
            exchange:'craken',
            currency_code:'BTC',
            amount:balance.craken_BTC
        },
        {
            exchange_type:2,
            exchange:'bitflyer',
            currency_code:'BTC',
            amount:balance.bitflyer_BTC
        },
        {
            exchange_type:1,
            exchange:'craken',
            currency_code:'ETH',
            amount:balance.craken_ETH
        },
        {
            exchange_type:2,
            exchange:'bitflyer',
            currency_code:'ETH',
            amount:balance.bitflyer_ETH
        },
    ];

    var candyThinkBoards = [];
    var no = 0;

    groupedBoards.forEach(function(board){
        _.each(_.pick(board, 'asks', 'bids'),function(orders, ask_bid){
            orders.forEach(function(order){          
                candyThinkBoards.push({
                    no : no++,
                    transaction_type : 1,
                    transaction_nm : board.exchange,
                    ask_bid : ask_bid.substr(0,3),
                    num : order.price,
                    num_update : order.price,
                    amount : order.size,
                    amount_update : order.size,
                    time : board.time
                })
           });
        });
    });

    // ******************************************************************

    this.indicator.arbitrage(candyThinkBoards, candyThinkBalance, function(order){
    
        console.log(order);

    });

    /*
    if(result.order) {
        return result;
    } else {
        var err = new Error('Invalid advice from indicator, should be either: buy, sell or hold.');
        this.logger.error(err.stack);
        process.exit();
    }
    */

};

module.exports = advisor;
