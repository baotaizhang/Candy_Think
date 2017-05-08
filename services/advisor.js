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

advisor.prototype.update = function(groupedBoards, balance, callback) {

    // convert data with candyThink way.
    // ******************************************************************
    var candyThinkWay = convert(groupedBoards, balance);
    // ******************************************************************

    this.indicator.arbitrage(candyThinkWay.boards, candyThinkWay.balance, candyThinkWay.fee, function(orders){

        callback(orders);

    });
};

function convert(groupedBoards, balance){

    var candyThinkWay = {
    
        balance : [],
        boards : [],
        fee : []

    };

    candyThinkWay.balance = [ 
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

    candyThinkWay.fee = [
        {
            exchange_type:1,
            exchange:'kraken',
            fee:balance.krakenFee
        },
        {
            exchange_type:2,
            exchange:'bitflyer',
            fee:balance.bitflyerFee
        }
    ];

    var candyThinkBoards = [];
    var no = 0;

    groupedBoards.forEach(function(board){
        _.each(_.pick(board, 'asks', 'bids'),function(orders, ask_bid){
            orders.forEach(function(order){          
                
                if(board.exchange === 'bitflyer'){
                    candyThinkWay.boards.push({
                        no : no++,
                        exchange_type : 1,
                        exchange : board.exchange,
                        ask_bid : ask_bid.substr(0,3),
                        num : order.size,
                        amount : order.price,
                        product_code : 'ETH_BTC',
                        time : board.time
                    })

                }else if(board.exchange === 'kraken'){

                    candyThinkWay.boards.push({
                        no : no++,
                        exchange_type : 2,
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
    return candyThinkWay;
}

module.exports = advisor;
