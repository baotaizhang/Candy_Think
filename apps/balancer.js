var cronModule = require('cron').CronJob;
var _ = require('underscore');

var balancer = function(){

    this.job = new cronModule({
        cronTime: '*/5 * * * *', 
        onTick: function() {
            // execute batch function;
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

    1. 全ての送金が完了済みであることを確認
    2. 残高情報を取得
    3. 本来の残高比率との比較
    4. 本来の残高比率とするための送金

}

balancer.prototype.start = function() {

    this.job.start();

};

var balancerApp = new balancer();

module.exports = balancerApp;
