var _ = require('underscore');
var async = require('async');

var firebaseService = require(__dirname + '/../services/firebase.js');
var streamService = require(__dirname + '/../services/stream.js');
var streamAggregatorService = require(__dirname + '/../services/streamAggregator.js');

var firebase = new firebaseService(candyConfig);
var stream = new streamService(firebase);
var streamAggregator = new streamAggregatorService(stream);

var trader = function(){

    streamAggregator.on('currentBoardPairStream', function(boards){
    
        exchangeapi.getBalance(true, function(balances){

            processor.process(boards, balances);

        });
    
    });

    processor.on('orderStream', function(order){
    
        agent.order(order);
    
    });
    
    _.bindAll(this, 'start');

};

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(backtester, EventEmitter);
//---EventEmitter Setup

trader.prototype.start = function() {

    stream.activation();

};

var traderApp = new trader();

module.exports = traderApp;
