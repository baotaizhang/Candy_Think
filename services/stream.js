var _ = require('underscore');

var stream = function(firebase){

    this.firebase = firebase;
    this.boards = [];

    _.bindAll(this, 'activation', 'placeOrder', 'orderChart');

}

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(stream, EventEmitter);
//---EventEmitter Setup

stream.prototype.activation = function(){

    this.firebase.settingConnection(function(setting){
        this.emit('settingStream', setting);
    }.bind(this));

    this.firebase.boardConnection(function(boards){
        this.emit('boardsStream', boards);
    }.bind(this));

}

stream.prototype.placeOrder = function(orderType){

    

}

stream.prototype.orderChart = function(order){

    var time = order.time;

    _.each(_.pick(order, 'price', 'size'), function(item, key){
        var pass = 'think/order/ETH_BTC/' + order.exchange + '/' + order.result + '/' + key;
        this.firebase.chartUpdate(pass, item, time);
    }.bind(this));
    
}

module.exports = stream;
