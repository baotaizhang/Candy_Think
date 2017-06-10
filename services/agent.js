var _ = require('underscore');
var async = require('async');

var agent = function(firebase){

    this.firebase = firebase;
    _.bindAll(this, 'order');

};

agent.prototype.order = function(ordertype){

    var pass = 'think/order_1_NotYet/ETH_BTC/' + orderType.exchange;
    this.firebase.placeOrder(pass, orderType);

    _.each(_.pick(order, 'price', 'size'), function(item, key){
        var pass = 'think/order/ETH_BTC/' + order.exchange + '/' + order.result + '/' + key;
        this.firebase.chartUpdate(pass, item, order.time);
    }.bind(this));

}

module.exports = agent;
