var cronModule = require('cron').CronJob;
var _ = require('underscore');
var async = require('async');
var tools = require(__dirname + '/../util/tools.js');

var balancer = function(exchangeapi, logger){

    this.job = new cronModule({
        cronTime: '*/6 * * * *', 
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

    logger.lineNotification("バランシングを試みます");

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
                async.parallel({
                    sendingAmount : function(next){

                        var sendingAmount = {};

                        result.balances.forEach(function(balance){
                            var key = Object.keys(balance)[0];
                            sendingAmount[key] = {
                                btc : balance[key].currencyAvailable,
                                eth : balance[key].assetAvailable
                            };
                        });

                        next(null, sendingAmount);

                    },
                    address : function(next){

                        var address = {};

                        result.assetAddresses.forEach(function(assetAddress){

                            var key = Object.keys(assetAddress)[0];
                            address[key] = {
                                eth : assetAddress[key].address[0].address
                            };

                        });

                        result.currencyAddresses.forEach(function(currencyAddress){

                            var key = Object.keys(currencyAddress)[0];
                            address[key] = {
                                btc : currencyAddress[key].address[0].address
                            };

                        });

                        next(null, address);

                    }
                }, function(err, result){

                    if(err){

                        throw err;

                    }

                    if(result.sendingAmount.bitflyer.btc > 0.001){
                        logger.lineNotification("送金を開始\nTo kraken : " + tools.round(result.sendingAmount.bitflyer.btc, 8) + "BTC");
                        exchangeapi.sendBTC(false, 'bitflyer', result.sendingAmount.bitflyer.btc - 0.0006, result.address.kraken.btc, function(result){
                            console.log(result);
                        });
                    }

                    if(result.sendingAmount.kraken.eth > 0.01){
                        logger.lineNotification("送金を開始\nTo bitflyer : " + tools.round(result.sendingAmount.kraken.eth, 8) + "ETH");
                        exchangeapi.sendETH(false, 'kraken', result.sendingAmount.kraken.eth, "bitflyer_eth", function(result){
                            console.log(result);
                        });
                    }
                    
                    if(result.sendingAmount.kraken.eth < 0.01 && result.sendingAmount.bitflyer.btc < 0.001){
                        logger.lineNotification("送金が必要な残高はありません");
                    }
                })
                        
            }else{
                logger.lineNotification("pending statusの残高があるため、バランシングは実施しません");
            }
        });
    });   
}


balancer.prototype.start = function() {

    this.job.start();

};

module.exports = balancer;

