var _ = require('underscore');
var async = require('async');
var kraken = require(__dirname + '/../exchanges/kraken.js');
var bitflyer = require(__dirname + '/../exchanges/bitflyer.js');

var api = function(candyConfig, logger){

    var kraken_access = new kraken(candyConfig, logger);
    var bitflyer_access = new bitflyer(candyConfig, logger);

    this.exchangesAccess = [
        {
            api:kraken_access, 
            name:"kraken"
        },
        {
            api:bitflyer_access, 
            name:"bitflyer"
        }
    ];

    _.bindAll(this, 
        'getBalance', 
        'currencyWithdrawalStatus', 
        'assetWithdrawalStatus',
        'currencyDepositStatus',
        'assetDepositStatus',
    );

};

api.prototype.getBalance = function(retry, cb){

    async.map(this.exchangesAccess, function(exchangeAccess, next){
        balance = exchangeAccess.api.getBalance(retry, next);
    }, function(err, balances){

        if(err){
            throw err;
        }

        cb(balances);

    });
};
    
api.prototype.currencyWithdrawalStatus = function(retry, cb){
    async.map(this.exchangesAccess, function(exchangeAccess, next){
        status = exchangeAccess.api.currencyWithdrawalStatus(retry, next);
    }, function(err, statuses){
        if(err){
            throw err;
        }
        cb(statuses);
    });
};

api.prototype.assetWithdrawalStatus = function(retry, cb){
    async.map(this.exchangesAccess, function(exchangeAccess, next){
        status = exchangeAccess.api.assetWithdrawalStatus(retry, next);
    }, function(err, statuses){
        if(err){
            throw err;
        }
        cb(statuses);
    });
};

api.prototype.currencyDepositStatus = function(retry, cb){
    async.map(this.exchangesAccess, function(exchangeAccess, next){
        status = exchangeAccess.api.currencyDepositStatus(retry, next);
    }, function(err, statuses){
        if(err){
            throw err;
        }
        cb(statuses);
    });
};

api.prototype.assetDepositStatus = function(retry, cb){
    async.map(this.exchangesAccess, function(exchangeAccess, next){
        status = exchangeAccess.api.assetDepositStatus(retry, next);
    }, function(err, statuses){
        if(err){
            throw err;
        }
        cb(statuses);
    });
};

module.exports = api;
