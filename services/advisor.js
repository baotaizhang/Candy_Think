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
            exchange:'kraken',
            currency_code:'BTC',
            amount:balance.kraken_BTC
        },
        {
            exchange_type:2,
            exchange:'bitflyer',
            currency_code:'BTC',
            amount:balance.bitflyer_BTC
        },
        {
            exchange_type:1,
            exchange:'kraken',
            currency_code:'ETH',
            amount:balance.kraken_ETH
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
                
                if(board.exchange === 'bitflyer'){
                    candyThinkBoards.push({
                        no : no++,
                        exchange_type : board.exchange,
                        exchange : board.exchange,
                        ask_bid : ask_bid.substr(0,3),
                        num : order.size,
                        amount : order.price,
                        product_code : 'ETH_BTC',
                        time : board.time
                    })

                }else if(board.exchange === 'kraken'){

                    candyThinkBoards.push({
                        no : no++,
                        exchange_type : board.exchange,
                        exchange : board.exchange,
                        ask_bid : ask_bid.substr(0,3),
                        num : order[1],
                        amount : order[0],
                        product_code : 'ETH_BTC',
                        time : board.time
                    })
                }

           });
        });
    });

    // ******************************************************************

    this.indicator.arbitrage(candyThinkBoards, candyThinkBalance, function(orders){

        return orders;
    

    });
};

module.exports = advisor;
