var _ = require('underscore');

var stream = function(firebase){

    this.firebase = firebase;
    this.boards = [];

    _.bindAll(this, 'systemConnection', 'boardConnection');

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

stream.prototype.boardConnection = function(){

    this.firebase.boardConnection(function(board){
        if(board.orderFailed){
            this.emit('singleBoardStream', board);            
        }else{
            this.emit('boardsStream', board);
        }
    }.bind(this));

}

module.exports = stream;
