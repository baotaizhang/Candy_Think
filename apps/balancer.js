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

    1. �S�Ă̑����������ς݂ł��邱�Ƃ��m�F
    2. �c�������擾
    3. �{���̎c���䗦�Ƃ̔�r
    4. �{���̎c���䗦�Ƃ��邽�߂̑���

}

balancer.prototype.start = function() {

    this.job.start();

};

var balancerApp = new balancer();

module.exports = balancerApp;
