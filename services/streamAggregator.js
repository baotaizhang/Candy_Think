var _ = require('underscore');
var moment = require('moment');

var streamAggregator = function(stream){

    this.stream = stream;
    this.unpairedBoards = [];

    this.stream.on('boardsStream', function(boards){
    
        this.unpairedBoards.push(boards);

        var pairedBoards =  _.groupBy(this.unpairedBoards, function(board){

            if(board){
                return moment(board.time).format("YYYY-MM-DD HH:mm");
            }else{
                return moment().format("YYYY-MM-DD HH:mm");
            }

        });

    }.bind(this));

    _.bindAll(this, 'boardPairStream');

}

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(streamAggregator, EventEmitter);
//---EventEmitter Setup

streamAggregator.prototype.boardPairStream = function(boards){



}

module.exports = streamAggregator;
