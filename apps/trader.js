var _ = require('underscore');
var firebaseConnectorService = require(__dirname + '/../services/firebaseConnector.js');
var storageService = require(__dirname + '/../services/firebaseStorage.js');
/*
var processorService = require(__dirname + '/services/processor.js');
var aggregatorService = require(__dirname + '/services/aggregator.js'); 
var candyThinkService = require(__dirname + '/services/candyThink.js');
var agentService = require(__dirname + '/services/agent.js');
*/
var config = require(__dirname + '/../config.js');
var candyConfig = config.init();

var storage = new storageService(candyConfig);
var firebaseConnector = new firebaseConnectorService(storage);
/*
var processor = new processorService();
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

    firebaseConnector.on('receiveBoard', function(board){
    
        console.log(board);
        //processor.updateBoards(board);

    });
    /*
    processor.on('update', function(board){

        aggregator.update(board);

    });
    
    aggregator.on('update', function(boards){

        var judge = candyThink.Arbitrage(boards);

        if(judge === 'order') {

           agent.update(judge.result);

        } else if(advice === '') {

        }

    }

    agent.on('update', function(order){
    
        firebaseConnector.order(order);

    })
    */

    _.bindAll(this, 'start', 'stop');

}

trader.prototype.start = function() {

    firebaseConnector.start();

};

trader.prototype.stop = function(cb) {

    firebaseConnector.stop();

};

var traderApp = new trader();

module.exports = traderApp;
