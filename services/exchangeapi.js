var _ = require('underscore');
var async = require('async');
var kraken = require(__dirname + '/../exchanges/kraken.js');
var bitflyer = require(__dirname + '/../exchanges/bitflyer.js');

var api = function(candyConfig, logger){

    var kraken_access = new kraken(candyConfig, logger);
    var bitflyer_access = new bitflyer(candyConfig, logger);

    this.exchangesAccess = [
        kraken_access,
        bitflyer_access
    ];

    _.bindAll(this, 'getBalance');

};

api.prototype.getBalance = function(retry, cb){

    async.map(this.exchangesAccess, function(exchangeAccess, next){
    
        balance = exchangeAccess.getBalance(retry, next);
    
    }, function(err, balances){

        if(err){
            console.log(err);
        }
        console.log(balances);
        cb(balances);

    });
};
    
module.exports = api;
