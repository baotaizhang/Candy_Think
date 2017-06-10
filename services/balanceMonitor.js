var cronModule = require('cron').CronJob;
var _ = require('underscore');
var async = require('async');
var tools = require(__dirname + '/../util/tools.js');

//---EventEmitter Setup
var EventEmitter = require('events').EventEmitter;
//---EventEmitter Setup

var balancer = function(exchangeapi, logger){

    var ev = new EventEmitter;

    this.job = new cronModule({
        cronTime: '*/60 * * * *', 
        onTick: function() {
            balance(exchangeapi, logger, function(result){
                ev.emit('balance' ,result);
            });
        }.bind(this),
        start: true, 
        timeZone: "Asia/Tokyo"
    });

    this.job.start();
    return ev;

}

function balance(exchangeapi, logger, cb){

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
                    cb(balances);
                }.bind(this));
            }
        });
    });   
}


module.exports = balancer;

