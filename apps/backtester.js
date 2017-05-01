var _ = require('underscore');
var async = require('async');
var moment = require('moment');

var loggingservice = require(__dirname + '/../services/loggingservice.js');
var tradingadvisor = require(__dirname + '/../services/advisor.js');
var simulatorservice = require(__dirname + '/../services/simulator.js');
var storageService = require(__dirname + '/../services/storage.js');

var config = require(__dirname + '/../config.js');
var candyConfig = config.init();

var logger = new loggingservice('backtester');
var advisor = new tradingadvisor(storage, logger);
var simulator = new simulatorservice(advisor, logger);

var storage = new storageService(candyConfig);

var backtester = function(){

    _.bindAll(this, 'run', 'start');

};

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(backtester, EventEmitter);
//---EventEmitter Setup

backtester.prototype.run = function(){

    async.series(
        {
            /*balance : function(cb) {
                // exchangeapi.getBalance(true, cb);
                console.log('test');
                cb(true, {fee : 0});
            },*/
            groupedBoards : function(cb) {
                console.log(cb);
                storage.getAggregatedBoards(function(AggregatedBoards){ 
                    var groupedBoards =  _(AggregatedBoards).groupBy(function(board){     
                        return moment(board.time).format("YYYY-MM-DD HH:mm");
                    });
                    cb(true, groupedBoards);
                });
                cb(true);
            }
        }, function(err, result) {
                
            if(result.groupedBoards){
                simulator.calculate(result.groupedBoards, result.balance.fee, function(result) {
                    this.emit('done');
                }.bind(this));
            }
        }.bind(this)
    );
}

backtester.prototype.start = function() {

  this.run();

};

var backtesterApp = new backtester();

module.exports = backtesterApp;
