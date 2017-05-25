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
            }
        });

        _.each(pairedBoards, function(boards, time){
            if(boards.length >= 2){
                boards.forEach(function(board){
                    this.unpairedBoards = this.unpairedBoards.filter(function(unpairedBoard){
                        return unpairedBoard.key !== _.property('key')(board);
                    }.bind(this));
                }.bind(this));
                this.emit('boardsPairStream', boards);

                var time =  moment().format("YYYY-MM-DD HH:mm");

                if(moment().diff(boards[0].time,'minutes') < 5){ 
                    this.emit('currentBoardPairStream', boards);
                }

            }
        }.bind(this));

    }.bind(this));

}

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(streamAggregator, EventEmitter);
//---EventEmitter Setup

module.exports = streamAggregator;
