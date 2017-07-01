var _ = require('underscore');
var async = require('async');
var moment = require('moment');
var tools = require(__dirname + '/../util/tools.js');

var firebaseService = require(__dirname + '/../services/firebase.js');
var processorService = require(__dirname + '/../services/processor.js');
var loggingservice = require(__dirname + '/../services/loggingservice.js');
var tradingadvisor = require(__dirname + '/../services/advisor.js');
var exchangeapiService = require(__dirname + '/../services/exchangeapi.js');
var agentService = require(__dirname + '/../services/agent.js');
var cronService = require(__dirname + '/../services/cron.js');
var candyThinkOBJ = require(__dirname + '/../indicator/candyThink.js');

var config = require(__dirname + '/../config.js');
var candyConfig = config.init();
var setting = require('../setting.js');

var logger = new loggingservice('trader');
var candyThink = new candyThinkOBJ(setting);
var advisor = new tradingadvisor(candyThink, logger, setting);
var firebase = new firebaseService(candyConfig, setting);
var processor = new processorService(advisor, stream, logger);
var exchangeapi = new exchangeapiService(candyConfig, logger, setting);
var agent = new agentService(firebase, setting);
var cron = new cronService(exchangeapi, logger);

var trader = function(){

    firebase.on('systemStream',function(system){
        if(system == 'stop'){
            logger.lineNotification("緊急停止が選択されました。システムを停止します", function(finished){
                finished();
                process.exit();
            });
        }else if(system == 'idle'){
            logger.lineNotification("アイドリングモードで待機します", function(finished){
                cron.job.stop();
                finished();
            });
        }else if(system == 'running'){
            logger.lineNotification("取引を開始します", function(finished){
                cron.job.start();
                finished();
            });
        }else{
            throw "不正なモードが選択されています";
        }
    });

    firebase.on('orderFailedStream', function(orderFailed){

        exchangeapi.getBalance(true, function(balances){
            exchangapi.getBoards(true, function(board){
                board[0].orderFailed = orderFailed;
                processor.process(board, balances);
            }, orderFailed.exchange);
        });

    });

    firebase.on('orderFailedCheck', function(count){
        
        if(count == 0){
            cron.job.start();
        }else{
            cron.job.stop();
        }

    });

    cron.ev.on('job', function(status){

        exchangeapi.getBalance(true, function(balances){
            exchangeapi.getBoards(true, function(boards){
                processor.process(boards, balances);
            });
            balances.forEach(function(balance){
                var key = Object.keys(balance)[0];
                firebase.chartUpdate(setting.balancePass +key + '/' + setting.currency, balance[key].currencyAvailable ,moment().format("YYYY-MM-DD HH:mm:ss"));
                firebase.chartUpdate(setting.balancePass + key + '/' + setting.asset, balance[key].assetAvailable ,moment().format("YYYY-MM-DD HH:mm:ss"));
            });
        });

    });

    processor.on('orderStream', function(order){
        agent.order(order); 
    });

    process.on('uncaughtException', function (err) {
        logger.lineNotification("リカバリ不可のエラーが発生しました。システムを強制終了します\n" + err, function(finished){
            process.exit(1);
        });
    });

    process.on('exit', function (code) {
        console.log('exit code : ' + code);
    });

    _.bindAll(this, 'start');

};

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(trader, EventEmitter);
//---EventEmitter Setup

trader.prototype.start = function() {
    cron.job.start();
};

var traderApp = new trader();

module.exports = traderApp;
