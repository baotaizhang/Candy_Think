var _ = require('underscore');
var async = require('async');

var agent = function(stream){

    this.stream = stream;
    _.bindAll(this, 'order');

};

agent.prototype.order = function(ordertype){
    this.stream.placeOrder(ordertype);
    this.stream.orderChart(ordertype);
}

module.exports = agent;
