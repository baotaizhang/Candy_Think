var _ = require('underscore');

var streamAggregator = function(stream){

    this.stream = stream;
    this.unpairedBoards = [];

    _.bindAll(this, 'boardPairStream');

}

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(backtester, EventEmitter);
//---EventEmitter Setup

streamAggregator.prototype.boardPairStream(boards){

    this.unpairedBoards.push(boards);

    var pairedBoards =  _.groupBy(unpairedBoards, function(board){

        return moment(board.time).format("YYYY-MM-DD HH:mm");

    });

    pairedBoards.forEach(function(pairedBoard){
        
        if(pairedBoard.length >= 2){

            this.unpairedBoards = this.unpairedBoards.filter(function(unpairedBoard){

                return unpairedBoard.key != pairedBoard.key;

            });

            this.emit('boardPairStream', groupedBoards);
        
        }

    });

}

this.stream.on('boardsStream', function(boards){
    
    this.boardPairStream(boards);
    
)};

module.exports = streamAggregator;
