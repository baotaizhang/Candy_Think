var _ = require('underscore');

var stream = function(firebase){

    this.firebase = firebase;
    this.boards = [];

    _.bindAll(this, 'activation');

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

module.exports = stream;
