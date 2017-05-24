var cronModule = require('cron').CronJob;
var _ = require('underscore');
var async = require('async');

var balancer = function(exchangeapi){

    this.exchangeapi = exchangeapi;

    this.job = new cronModule({
        cronTime: '*/1 * * * *', 
        onTick: function() {
            balance(exchangeapi);
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

function balance(exchangeapi){

    async.series({
        withdrawalStatus: function(next){
            exchangeapi.withdrawalStatus(true, function(withdrawalStatus){
                next(null, withdrawalStatus);
            });
        },
        balances: function(next){
            this.exchangeapi.getBalance(true, function(balances){
                next(null, balances);  
            });
        }
    },function(err, result){

        var isPending = _.find(result.withdrawalStatus, function(status){
            return status.status == 'PENDING';    
        });

        if(!isPending){

           /*
           async.parallel([
               function(next){
                    exchangeapi.sendETH(true, 'kraken', result.balances.kraken.eth, candyConfig.bitflyerETHAddress, function(result){
                        console.log(result);
                    });
               },
               function(next){
                    exchangeapi.sendBTC(true, 'bitflyer', result.balances.bitflyer.btc, candyConfig.krakenBTCAddress, function(result){
                        console.log(result);
                    });
                }
            ], function(err, result){
                console.log(err);
            });
            */
            }
        });
    }


balancer.prototype.start = function() {

    this.job.start();

};

module.exports = balancer;
