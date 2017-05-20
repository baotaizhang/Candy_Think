var cronModule = require('cron').CronJob;
var _ = require('underscore');

var balancer = function(){

    this.job = new cronModule({
        cronTime: '*/5 * * * *', 
        onTick: function() {
            this.balance();
        },
    start: true, 
    timeZone: "Asia/Tokyo"
    });

    _.bindAll(this, 'balance', start);

}

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(backtester, EventEmitter);
//---EventEmitter Setup

balancer.prototype.balance = function(){

    async.series({
        withdrawalStatus: function(next){
            exchangeApi.withdrawalStatus(true, function(withdrawalStatus){
                next(null, withdrawalStatus);
            });
        },
        balances: function(next){
            exchangeapi.getBalance(true, function(balances){
                next(null, balances);  
            });
        }
    },function(err, result){

        var isPending = _.find(result.withdrawalStatus, function(status){
            return status.status == 'PENDING';    
        });

        if(!isPending){

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
        }
    }
}

balancer.prototype.start = function() {

    this.job.start();

};

var balancerApp = new balancer();

module.exports = balancerApp;
