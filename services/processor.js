var _ = require('underscore');
var moment = require('moment');
var async = require('async');

var processor = function(advisor, logger, inMemory, reporter){

    this.logger = logger;
    this.advisor = advisor;
    this.inMemory = inMemory;
    this.reporter = reporter;

    this.q = async.queue(function (task, callback) {
        this.logger.debug('Added ' + task.name + ' call to the process queue.');
        this.logger.debug('There are currently ' + this.q.running() + ' running jobs and ' + this.q.length() + ' jobs in queue.');
        task.func(function() { 
            setTimeout(callback, 1000 * 60); 
        });
    }.bind(this), 1);

    _.bindAll(this, 'process', 'orderFailedVacuum');

};

processor.prototype.process = function(action, orderFailed, exchangeapi) {

    var wrapper = function(finished){
        console.log("starting process : " + action.action);
        exchangeapi.getBalance(action.getBalanceRetry, function(balances){
            this.reporter.reportRevenue(balances);
            exchangeapi.getBoards(action.getBoardRetry, function(board){
                exchangeapi.getFiatRate(true, function(fiatRate){
                    this.advisor.update(action, board, balances, fiatRate, orderFailed, function(orders){
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
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }.bind(this);

    if(action == 'orderFailed'){
        this.q.unshift({name: 'unshiftProcess', func: wrapper});
    }else{
        this.q.push({name: 'process', func: wrapper});
    }
};

processor.prototype.orderFailedVacuum = function(action, orderFailed, exchangeapi, process){

    this.inMemory.orderFailed.push(orderFailed);

    if(this.inMemory.orderFailed.length == 1){
        setTimeout(function(){
            process(action, this.inMemory.orderFailed, exchangeapi);
            inMemory.orderFailed = [];
        }, 1000*30);
    }

};

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(processor, EventEmitter);
//---EventEmitter Setup

module.exports = processor;

