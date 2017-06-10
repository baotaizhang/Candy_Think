var _ = require('underscore');
var moment = require('moment');

var streamAggregator = function(stream){

    this.stream = stream;
    this.unpairedBoards = [];
    this.orderFailed = true;

    this.stream.on('orderFailedStream', function(orderAmount){
        orderAmount == 0 ? this.orderFailed = false : this.orderFailed = true;
    })

    this.stream.on('boardsStream', function(boards){
    
        this.unpairedBoards.push(boards);

        var pairedBoards = _.groupBy(this.unpairedBoards, function(board){
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

                if(moment().diff(boards[0].time,'minutes') < 1){
                    if(!this.orderFailed){
                        this.emit('boardPairStream', boards);
                    }
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
