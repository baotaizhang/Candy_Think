var _ = require('underscore');
var moment = require('moment');

var streamAggregator = function(stream, setting){

    this.stream = stream;
    this.setting = setting;
    this.unpairedBoards = [];
    var orderFailed = false;

    this.stream.on('orderFailedStream', function(orderAmount){
        orderAmount == 0 ? orderFailed = false : orderFailed = true;
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

                if(moment().diff(boards[0].time,'minutes') < this.setting.boardLimit * 5){
                    if(!orderFailed){
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
