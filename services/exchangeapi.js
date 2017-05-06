var _ = require('underscore');
var async = require('async');
var kraken = require(__dirname + '/../exchanges/kraken.js');


var api = function(candyConfig, logger){

    var kraken_access = new kraken(candyConfig, logger);

    this.exchangesAccess = [
        kraken_access
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
        cb(balances);

    });
};
    
module.exports = api;
