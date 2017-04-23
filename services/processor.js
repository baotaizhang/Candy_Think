var _ = require('underscore');
var moment = require('moment');

var processor = function(storage){

    this.storage = storage;
    this.initial = false;

    _.bindAll(this, 'createBoard', 'processUpdate', 'updateBoards');

}

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(processor, EventEmitter);
//---EventEmitter Setup

processor.prototype.createBoard = function(board, callback){

    // 本来はここでSQLで操作可能な配列にするが、要件が不明なため保留
    // xxx
    
    this.storage.pushBoard(board, callback);
    
}

processor.prototype.processUpdate = function(err) {

    if(err) {

        console.log('Couldn\'t update targetBoard due to a database error');
        console.log(err);

    } else {

        this.storage.getUnprocessedBoard(function(err, unprocessedBoard) {

            if(!this.initialDBWriteDone) {

                this.emit('initialDBWrite');
                this.initialDBWriteDone = true;

            } else {

                this.emit('update', unprocessedBoard);

            }

        }.bind(this));
    }
};

processor.prototype.updateBoards = function(board){


    this.storage.getUnprocessedBoard(function(err, unprocessedBoard){

        var receivingDelay = moment(board.time).diff(moment(unprocessedBoard.time), 'minutes');

        // 1分で仮置き
        receivingDelay >= -1 ? this.createBoard(board, this.processUpdate) : "";


    }.bind(this));

}

module.exports = processor;
