var _ = require('underscore');
var async = require('async');

var loggingservice = require(__dirname + '/../services/loggingservice.js');
var tradingadvisor = require(__dirname + '/../services/advisor.js');
var simulatorservice = require(__dirname + '/../services/simulator.js');
var firebaseService = require(__dirname + '/../services/firebase.js');
var streamService = require(__dirname + '/../services/stream.js');
var streamAggregatorService = require(__dirname + '/../services/streamAggregator.js');

var config = require(__dirname + '/../config.js');
var candyConfig = config.init();

var logger = new loggingservice('backtester');
var advisor = new tradingadvisor(storage, logger);
var simulator = new simulatorservice(advisor, logger);
var firebase = new firebaseService(candyConfig);
var stream = new streamService(firebase);
var streamAggregator = new streamAggregatorService(stream);

var backtester = function(){

    streamAggregator.on('boardsPairStream', function(boards){
        simulator.calculate(boards, fee, function() {
            simulator.report();
        }.bind(this));
    });

    _.bindAll(this, 'start');

};

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(backtester, EventEmitter);
//---EventEmitter Setup

backtester.prototype.start = function() {

    stream.activation();

};

var backtesterApp = new backtester();

module.exports = backtesterApp;