var _ = require('underscore');
var async = require('async');
var kraken = require(__dirname + '/../exchanges/kraken.js');
var bitflyer = require(__dirname + '/../exchanges/bitflyer.js');
var poloniex = require(__dirname + '/../exchanges/poloniex.js');

var api = function(candyConfig, logger, setting){

    var kraken_access = new kraken(candyConfig, logger, setting);
    var bitflyer_access = new bitflyer(candyConfig, logger, setting);
    var poloniex_access = new poloniex(candyConfig, logger, setting);

    this.exchangesAccess = [
        {
            api:kraken_access, 
            name:"kraken"
        },
        {
            api:bitflyer_access, 
            name:"bitflyer"
        }/*,
        {
            api:poloniex_access, 
            name:"poloniex"
        }*/
    ];

    _.bindAll(this, 
        'getBalance', 
        'getBoards'
    );

};

api.prototype.getBalance = function(retry, cb, exchange){

    var exchangesAccess = exchange === undefined ? this.exchangesAccess : _.filter(this.exchangesAccess, function(exchangeAccess){
        return exchangeAccess.name == exchange;
    });

    async.map(exchangesAccess, function(exchangeAccess, next){
        balance = exchangeAccess.api.getBalance(retry, next);
    }, function(err, balances){

        if(err){
            throw err;
        }

        cb(balances);

    });
};

api.prototype.getBoards = function(retry, cb, exchange){

    var exchangesAccess = exchange === undefined ? this.exchangesAccess : _.filter(this.exchangesAccess, function(exchangeAccess){
        return exchangeAccess.name == exchange;
    });

    async.map(exchangesAccess, function(exchangeAccess, next){
        board = exchangeAccess.api.getBoard(retry, next);
    }, function(err, boards){
        if(err){
            throw err;
        }
        cb(boards);
    });

}

module.exports = api;
