var _ = require('underscore');
var async = require('async');

var firebaseService = require(__dirname + '/../services/firebase.js');
var streamService = require(__dirname + '/../services/stream.js');
var streamAggregatorService = require(__dirname + '/../services/streamAggregator.js');
var processorService = require(__dirname + '/../services/processor.js');
var loggingservice = require(__dirname + '/../services/loggingservice.js');
var tradingadvisor = require(__dirname + '/../services/advisor.js');
var exchangeapiService = require(__dirname + '/../services/exchangeapi.js');
var agentService = require(__dirname + '/../services/agent.js');

var config = require(__dirname + '/../config.js');
var candyConfig = config.init();

var logger = new loggingservice('trader');
var advisor = new tradingadvisor(logger);
var firebase = new firebaseService(candyConfig);
var stream = new streamService(firebase);
var streamAggregator = new streamAggregatorService(stream);
var processor = new processorService(advisor, stream, logger);
var exchangeapi = new exchangeapiService(candyConfig, logger);
var agent = new agentService(stream);

var trader = function(){

    streamAggregator.on('currentBoardPairStream', function(boards){
        exchangeapi.getBalance(true, function(balances){
            processor.process(boards, balances);
        });
    });

    processor.on('orderStream', function(order){
        agent.order(order); 
    });

    stream.on('systemStream',function(system){
        if(system.running == 'stop'){
            stream.removeAllListeners('systemStream');
            logger.lineNotification('緊急停止します。Firebaseから切断します。');
            var emergencyStop = setInterval(function(){
                if(processor.q.running() + processor.q.length() + logger.q.running() + logger.q.length() == 0){
                    firebase.disconnect();
                    clearInterval(emergencyStop);
                }else{
                     logger.lineNotification('稼働中のスレッドの完了を待っています・・・');
                }
            },5000);
        }
    });

    process.on('uncaughtException', function (err) {
        console.log(err);
        logger.lineNotification('予期しないエラーが発生しました。¥n' + err);
    }.bind(this));

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

    logger.lineNotification('trader modeが選択されました。Firebaseに接続します。');
    stream.activation();

};

var traderApp = new trader();

module.exports = traderApp;
