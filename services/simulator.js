var _ = require('underscore');
var moment = require('moment');
var async = require('async');

var simulator = function(advisor, logger){

    this.logger = logger;
    this.advisor = advisor;

  _.bindAll(this, 'calculate', 'createOrder');

};

simulator.prototype.calculate = function(groupedBoards, transactionFee, callback) {

    var result = this.advisor.update(boards);

    if (result.advice) {
        this.createOrder(result.advice, callback);
    }

};

simulator.prototype.createOrder = function(){};

module.exports = simulator;
