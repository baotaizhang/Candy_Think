var _ = require('underscore');

var candyThink = function(storage){

    this.storage = storage;
    this.sqlResult;

    _.bindAll(this,
        'arbitrage',
        'mySQLCB'
    );
}

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(firebaseConnector, EventEmitter);
//---EventEmitter Setup

candyThink.prototype.arbitrage = function(boards){

    /*
        board = [{
            time: moment().format("YYYY-MM-DD HH:mm:ss"),
            asks: response.result.XETHXXBT.asks,
            bids: response.result.XETHXXBT.bids
            exchange: 'kralen'
        },
        {   
            time: moment().format("YYYY-MM-DD HH:mm:ss"),
            bids: response.bids,
            asks: response.asks,
            exchange: 'bitflyer'
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

    storage.mySQLQuery(sql, value, this.sqlCB);

    // orderがなければnullをorderにセット
    this.emit('update', order);

}

// Just an example
candyThink.prototype.mySQLCB = function(err, result){
    if(err){
        console.log(err);
    }else{
        console.log('--- results ---');
	    console.log(result);
        this.sqlResult = result;
    }
});

module.exports = candyThink;
