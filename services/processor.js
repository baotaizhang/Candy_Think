var _ = require('underscore');
var moment = require('moment');
var async = require('async');

var processor = function(advisor, logger){

    this.logger = logger;
    this.advisor = advisor;

    this.q = async.queue(function (task, callback) {
        this.logger.debug('Added ' + task.name + ' call to the process queue.');
        this.logger.debug('There are currently ' + this.q.running() + ' running jobs and ' + this.q.length() + ' jobs in queue.');
        task.func(function() { 
            setTimeout(callback, 200); 
        });
    }.bind(this), 1);

    _.bindAll(this, 'process');

};

processor.prototype.process = function(boards, balances) {

    var wrapper = function(finished){
        this.advisor.update(boards, balances, function(orders){
            orders.forEach(function(order){         
                if(order.result) {
                    this.emit('orderStream', order);
                } else {
                    var err = 'Invalid advice from indicator, should be either: buy or sell.';
                    throw err;
                }
            }.bind(this));

            finished();

        }.bind(this));
    }.bind(this);

    this.q.push({name: 'process', func: wrapper});
};

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(processor, EventEmitter);
//---EventEmitter Setup

module.exports = processor;
