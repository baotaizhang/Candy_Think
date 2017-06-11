var _ = require('underscore');
var async = require('async');
var moment = require('moment');
var tools = require(__dirname + '/../util/tools.js');

var firebaseService = require(__dirname + '/../services/firebase.js');
var streamService = require(__dirname + '/../services/stream.js');
var streamAggregatorService = require(__dirname + '/../services/streamAggregator.js');
var processorService = require(__dirname + '/../services/processor.js');
var loggingservice = require(__dirname + '/../services/loggingservice.js');
var tradingadvisor = require(__dirname + '/../services/advisor.js');
var exchangeapiService = require(__dirname + '/../services/exchangeapi.js');
var agentService = require(__dirname + '/../services/agent.js');
var balanceMonitorService = require(__dirname + '/../services/balanceMonitor.js');
var candyThinkOBJ = require(__dirname + '/../indicator/candyThink.js');

var config = require(__dirname + '/../config.js');
var candyConfig = config.init();
var setting = require('../setting.js');

var logger = new loggingservice('trader');
var candyThink = new candyThinkOBJ(setting);
var advisor = new tradingadvisor(candyThink, logger, setting);
var firebase = new firebaseService(candyConfig, setting);
var stream = new streamService(firebase);
var streamAggregator = new streamAggregatorService(stream, setting);
var processor = new processorService(advisor, stream, logger);
var exchangeapi = new exchangeapiService(candyConfig, logger, setting);
var agent = new agentService(stream);
var balanceMonitor = new balanceMonitorService(exchangeapi, logger);

var trader = function(){

    stream.on('systemStream',function(system){
        if(system == 'stop'){
            logger.lineNotification("緊急停止が選択されました。システムを停止します", function(finished){
                finished();
                process.exit();
            });
        }else if(system == 'idle'){
            logger.lineNotification("アイドリングモードで待機します", function(finished){
                finished();
                firebase.boardDetach();
            });
        }else if(system == 'running'){
            logger.lineNotification("取引を開始します", function(finished){
                finished();
            });
        }else{
            throw "不正なモードが選択されています";
        }
    });

    /*streamAggregator.on('boardPairStream', function(boards){
        exchangeapi.getBalance(true, function(balances){
            processor.process(boards, balances);
        });
    });*/
    
    exchangeapi.getBalance(true, function(balances){
        stream.dealConnection();
        streamAggregator.on('boardPairStream', function(boards){
            processor.process(boards, balances);
        });
    });

    stream.on('singleBoardStream', function(board){

        var pushed = [];
        pushed.push(board);

        /*exchangeapi.getBalance(true, function(balances){
            processor.process(pushed, balances);
        });*/
    });

    balanceMonitor.on('balance', function(balances){
        balances.forEach(function(balance){
            var key = Object.keys(balance)[0];
            logger.lineNotification(key + "の残高は\nBTC : " + tools.round(balance[key].currencyAvailable, 8) + 
            "\nETH : " + tools.round(balance[key].assetAvailable, 8) + "\nです");

            firebase.chartUpdate('/think/chart/balance/' + key + '/' + setting.currency, balance[key].currencyAvailable ,moment().format("YYYY-MM-DD HH:mm:ss"));
            firebase.chartUpdate('/think/chart/balance/' + key + '/' + setting.asset, balance[key].assetAvailable ,moment().format("YYYY-MM-DD HH:mm:ss"));
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
    stream.systemConnection();
};

var traderApp = new trader();

module.exports = traderApp;

