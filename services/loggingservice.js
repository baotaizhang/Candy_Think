var moment = require('moment');
var _ = require('underscore');
var winston = require('winston');
require('winston-daily-rotate-file');
var fs = require('fs');
var util = require('util');
var async = require('async');

var firebaseService = require(__dirname + '/../services/firebase.js');

var config = require(__dirname + '/../config.js');
var candyConfig = config.init();

var firebase = new firebaseService(candyConfig);

var logger = function(app, setting) {

    this.q = async.queue(function (task, callback) {
        task.func(function() { setTimeout(callback, 2000); });
    }.bind(this), 1);

    this.debugEnabled = true;

    if (!fs.existsSync('logs')) {
        fs.mkdirSync('logs');
    }

    var myCustomLevels = {
        levels: {
            DEBUG: 0,
            INFO: 1,
            ERROR: 2
        }
    };

    var now = function() {
        var format = moment(new Date()).format('DD-MM-YYYY HH:mm:ss');
        return '[' + format + ']';
    };

    this.logger = new (winston.Logger)({
        levels: myCustomLevels.levels,
        transports: [
        new (winston.transports.Console)({
            'timestamp': now,
            level: 'INFO' }),
        new (winston.transports.DailyRotateFile)({
            'timestamp': now,
            datePattern: '_dd-MM-yyyy.log',
            filename: 'logs/' + app,
            level: 'DEBUG'})
        ]
    });

    _.bindAll(this, 'log', 'debug', 'error');

};

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(logger, EventEmitter);
//---EventEmitter Setup

logger.prototype.lineNotification = function(message){
    var wrapper = function(finished){
        firebase.lineNotification(message, moment().format('DD-MM-YYYY HH:mm:ss'), finished);
    }.bind(this);

    this.q.push({name: 'lineNotification', func: wrapper});

}

logger.prototype.log = function(message) {
    this.logger.log('INFO', util.inspect(message));
};

logger.prototype.debug = function(message) {
    if(this.debugEnabled) {
        this.logger.log('DEBUG', util.inspect(message));
    }
};

logger.prototype.error = function(module, message) {
    this.logger.log('ERROR', util.inspect(message));
    this.lineNotification(module + ' でエラーが発生しました。¥n' + err);
};

logger.prototype.linelog = function(message){
    this.lineNotification(message);
};

process.on('uncaughtException', function (err) {
    this.lineNotification('予期しないエラーが発生しました。¥n' + err);
});

process.on('beforeExit', function(){
    this.lineNotification('実行中のスレッドの完了次第、exitします。');
});

process.on('exit', function (code) {
    this.lineNotification('すべてのプロセスが完了しました。¥n return code: ' + code);
});

module.exports = logger;
