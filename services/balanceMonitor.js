var cronModule = require('cron').CronJob;
var _ = require('underscore');
var async = require('async');
var tools = require(__dirname + '/../util/tools.js');

var balancer = function(exchangeapi, logger){

    this.job = new cronModule({
        cronTime: '*/30 * * * *', 
        onTick: function() {
            balance(exchangeapi, logger);
        },
        start: true, 
        timeZone: "Asia/Tokyo"
    });

    this.job.start();

}

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(balancer, EventEmitter);
//---EventEmitter Setup

function balance(exchangeapi, logger){

    async.series({
        assetWithdrawalStatus: function(next){
            exchangeapi.assetWithdrawalStatus(true, function(withdrawalStatus){
                console.log(withdrawalStatus);
                next(null, withdrawalStatus);
            });
        },
        currencyWithdrawalStatus: function(next){
            exchangeapi.currencyWithdrawalStatus(true, function(withdrawalStatus){
                console.log(withdrawalStatus);
                next(null, withdrawalStatus);
            });
        },
        assetDepositStatus: function(next){
            exchangeapi.assetDepositStatus(true, function(depositStatus){
                console.log(depositStatus);
                next(null, depositStatus);
            });
        },
        currencyDepositStatus: function(next){
            exchangeapi.currencyDepositStatus(true, function(depositStatus){
                console.log(depositStatus);
                next(null, depositStatus);
            });
        },
    },function(err, result){

        if(err){
            throw err;
        };

        var target = _.union(result.currencyWithdrawalStatus, result.assetWithdrawalStatus, result.currencyDepositStatus, result.assetDepositStatus);
        var isPending = false;

        async.each(target, function(object, next){
            _.each(object, function(item, key){
                _.each(item.status, function(item){
                    if(item.status != 'Success' && item.status != 'COMPLETED'){
                        isPending = true;
                    }
                })
            })
            next(isPending);
        }, function(isPending){
            if(!isPending){
                exchangeapi.getBalance(true, function(balances){
                    this.emit(balances);
                }.bind(this));
            }
        });
    });   
}


module.exports = balancer;
