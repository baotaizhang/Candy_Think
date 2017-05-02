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

advisor.prototype.update = function(boardPair) {

    var result = this.indicator.arbitrage(boardPair);

    if(result.order) {
        // this.emit('advice', result);
        return result;

    } else {
        var err = new Error('Invalid advice from indicator, should be either: buy, sell or hold.');
        this.logger.error(err.stack);
        process.exit();
    }

};

module.exports = advisor;
