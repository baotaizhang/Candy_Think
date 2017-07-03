var cronModule = require('cron').CronJob;
var _ = require('underscore');
var async = require('async');
var tools = require(__dirname + '/../util/tools.js');

//---EventEmitter Setup
var EventEmitter = require('events').EventEmitter;
//---EventEmitter Setup

var cron = function(){

    this.ev = new EventEmitter;

    this.job = new cronModule({
        cronTime: '*/05 * * * *', 
        onTick: function() {
            this.ev.emit('job' ,'ontick!');
        }.bind(this),
        start: true, 
        timeZone: "Asia/Tokyo"
    });

    this.job.start();

}

module.exports = cron;

