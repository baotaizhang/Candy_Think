var cronModule = require('cron').CronJob;
var _ = require('underscore');
var async = require('async');

var balancer = function(exchangeapi, logger){

    this.job = new cronModule({
        cronTime: '*/1 * * * *', 
        onTick: function() {
            balance(exchangeapi, logger);
        },
        start: true, 
        timeZone: "Asia/Tokyo"
    });

    _.bindAll(this, 'start');

}

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(balancer, EventEmitter);
//---EventEmitter Setup

function balance(exchangeapi, logger){

    logger.lineNotification("バランシングを実施します");

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
        assetAddresses: function(next){
            exchangeapi.assetAddresses(true, function(addresses){
                console.log(addresses);
                next(null, addresses);
            });
        },
        currencyAddresses: function(next){
            exchangeapi.currencyAddresses(true, function(addresses){
                console.log(addresses);
                next(null, addresses);
            });
        },
        balances: function(next){
            exchangeapi.getBalance(true, function(balances){
                next(null, balances);  
            });
        }
    },function(err, result){

        if(err){
            throw err;
        };

        var target = _.values(_.values(_.union(_.values(result.currencyWithdrawalStatus), _.values(result.assetWithdrawalStatus), _.values(result.currencyDepositStatus), _.values(result.assetDepositStatus))));

        async.filter(_.union(_.values(result.currencyWithdrawalStatus), _.values(result.assetWithdrawalStatus), _.values(result.currencyDepositStatus), _.values(result.assetDepositStatus)), function(status, next){
            next(status != 'Success' || 'COMPLETED');
        }, function(isPending){

            console.log(isPending);
            
            if(_.isEmpty(isPending)){
                /*
                async.parallel([
                    function(next){
                        exchangeapi.sendETH(true, 'kraken', result.balances.kraken.eth, result.bitflyerETHAddress, function(result){
                            console.log(result);
                        });
                    },
                    function(next){
                        exchangeapi.sendBTC(true, 'bitflyer', result.balances.bitflyer.btc, result.krakenBTCAddress, function(result){
                            console.log(result);
                        });
                    }
                ], function(err, result){
                    console.log(err);
                });
                */
            }else{
                logger.lineNotification("送金中のため、バランシングは実施しません");
            }
        })
    });
}


balancer.prototype.start = function() {

    this.job.start();

};

module.exports = balancer;

