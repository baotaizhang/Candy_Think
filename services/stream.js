var _ = require('underscore');

var stream = function(firebase){

    this.firebase = firebase;
    this.boards = [];

    _.bindAll(this, 'systemConnection', 'dealConnection');

}

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(stream, EventEmitter);
//---EventEmitter Setup

stream.prototype.systemConnection = function(){

    this.firebase.systemConnection(function(system){
        this.emit('systemStream', system);
    }.bind(this));

}

stream.prototype.dealConnection = function(){

    this.firebase.boardConnection(function(board){
        if(board.orderFailed){
            this.emit('singleBoardStream', board);            
        }else{
            this.emit('boardsStream', board);
        }
    }.bind(this));

    this.firebase.orderFailedConnection(function(orderAmount){
        this.emit('orderFailedStream', orderAmount);
    }.bind(this));

}

module.exports = stream;
