var _ = require('underscore');

var candyThink = function(storage){

    this.storage = storage;

    _.bindAll(this,
        'arbitrage'
    );
}

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(candyThink, EventEmitter);
//---EventEmitter Setup

candyThink.prototype.arbitrage = function(boards){

    /*
        board = [{
            time: moment().format("YYYY-MM-DD HH:mm:ss"),
            asks: response.result.XETHXXBT.asks,
            bids: response.result.XETHXXBT.bids
            name: 'kralen'
        },
        {   
            time: moment().format("YYYY-MM-DD HH:mm:ss"),
            bids: response.bids,
            asks: response.asks,
            name: 'bitflyer'
        }];
        // bids以下は例えば・・・
        bids = [{
            price : 0.0395,
            size : 2.5
            },
            {
            price : 0.0391,
            size : 11
            }....
        ]
    */

    console.log('board[0] exchange = ' + boards[0].name + '. Time = ' + boards[0].time);
    console.log('board[1] exchange = ' + boards[1].name + '. Time = ' + boards[1].time);

    var order = [
        {
            exchange : 'bitflyer',
            child_order_type: "LIMIT",
            side: "BUY",
            price: 0,
            size: 0,
            minute_to_expire: 0,
            time_in_force: "GTC"
        },
        {
            exchange : 'kraken',
            child_order_type: "LIMIT",
            side: "sell",
            price: 0,
            size: 0,
            minute_to_expire: 0,
            time_in_force: "GTC"
        }

    ];

    // orderがなければnullをorderにセット
    this.emit('update', order);

}

/* Just an example
candyThink.prototype.mySQLCB = function(err, result){
    if(err){
        console.log(err);
    }else{
        console.log('--- results ---');
	    console.log(result);
        this.sqlResult = result;
    }
});

*/

module.exports = candyThink;
