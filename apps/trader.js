var _ = require('underscore');
var connectorService = require(__dirname + '/../services/connector.js');
var storageService = require(__dirname + '/../services/storage.js');
var processorService = require(__dirname + '/../services/processor.js');

/*
var aggregatorService = require(__dirname + '/services/aggregator.js'); 
var candyThinkService = require(__dirname + '/services/candyThink.js');
var agentService = require(__dirname + '/services/agent.js');
*/
var config = require(__dirname + '/../config.js');
var candyConfig = config.init();

var storage = new storageService(candyConfig);
var connector = new connectorService(storage);
var processor = new processorService(storage);

/*
var aggregator = new aggregatorService();
var candyThink = new candyThinkService();
var agent = new agentService();
*/

var trader = function(){

    //---EventEmitter Setup
    var Util = require('util');
    var EventEmitter = require('events').EventEmitter;
    Util.inherits(trader, EventEmitter);
    //---EventEmitter Setup

    connector.on('receiveBoard', function(board){
    
        processor.updateBoards(board);

    });
    processor.on('update', function(board){

        console.log('Think! ' + board[0].name + ' VS ' + board[1].name);
        // aggregator.update(board);

    });

    processor.on('initialDBWrite', function(){

        console.log('will launch necessary module to order');
        /*
        reporter.start();
        advisor.start();
        */

    });
    
    
    //aggregator.on('update', function(boards){

        /*
        var judge = candyThink.Arbitrage(boards);

        if(judge === 'order') {

           agent.update(judge.result);

        } else if(advice === '') {

        }
        */

    //});

    /*
    agent.on('update', function(order){
    
        firebaseConnector.order(order);

    })
    */

    _.bindAll(this, 'start', 'stop');

}

trader.prototype.start = function() {

    connector.start();

};

trader.prototype.stop = function(cb) {

    connector.stop();

};

var traderApp = new trader();

module.exports = traderApp;
