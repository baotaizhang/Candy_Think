var _ = require('underscore');
var connectorService = require(__dirname + '/../services/connector.js');
var storageService = require(__dirname + '/../services/storage.js');
var processorService = require(__dirname + '/../services/processor.js');
var candyThinkService = require(__dirname + '/../services/candyThink.js');
var loggingservice = require(__dirname + '/../services/loggingservice.js');
var settingService = require(__dirname + '/../services/settingService.js');

/*
var aggregatorService = require(__dirname + '/services/aggregator.js'); 
var agentService = require(__dirname + '/services/agent.js');
*/
var config = require(__dirname + '/../config.js');
var candyConfig = config.init();

var storage = new storageService(candyConfig);
var connector = new connectorService(storage);
var processor = new processorService(storage);
var candyThink = new candyThinkService();
var logger = new loggingservice('trader');
var setting = new settingService(storage, logger);

/*
var aggregator = new aggregatorService();
var agent = new agentService();
*/

var trader = function(){

    setting.connection();

    connector.on('receiveBoard', function(board){
    
        processor.updateBoards(board);

    });

    processor.on('initialDBWrite', function(){

        /*
        reporter.start();
        advisor.start();
        */

    });

    processor.on('update', function(board){

        console.log('Think! ' + board[0].name + ' VS ' + board[1].name);
        candyThink.arbitrage(board);
        //aggregator.update(board);

    });

    candyThink.on('update', function(order){
    
        console.log('order created.' + order[0].side + ' & ' + order[1].side);

    });


    /* 
    aggregator.on('update', function(boards){

        candyThink.Arbitrage(boards);

 

    });
    
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
    this.emit('done');

};

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(trader, EventEmitter);
//---EventEmitter Setup



var traderApp = new trader();

module.exports = traderApp;
