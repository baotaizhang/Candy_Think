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
var setting = require('../setting.js');

var logger = new loggingservice('trader');
var advisor = new tradingadvisor(logger, setting);
var firebase = new firebaseService(candyConfig, setting);
var stream = new streamService(firebase);
var streamAggregator = new streamAggregatorService(stream);
var processor = new processorService(advisor, stream, logger);
var exchangeapi = new exchangeapiService(candyConfig, logger);
var agent = new agentService(stream);

var trader = function(){

    stream.on('systemStream',function(system){
        if(system.running == 'stop'){
            logger.lineNotification("�ً}��~���I������܂����B�V�X�e�����~���܂�", function(finished){
                process.exit();
            });
        }else if(system.running == 'idle'){
            logger.lineNotification("�A�C�h�����O���[�h�őҋ@���܂�", function(finished){
                finished();
                firebase.boardDetach();
            });
        }else if(system.running == 'running'){
            logger.lineNotification("������J�n���܂�", function(finished){
                finished();
                stream.boardConnection();
            });
        }else{
            throw "�s���ȃ��[�h���I������Ă��܂�";
        }
    });

    streamAggregator.on('boardPairStream', function(boards){
        exchangeapi.getBalance(true, function(balances){
            processor.process(boards, balances);
        });
    });

    stream.on('alterBoardStream'function(boards){
        exchangeapi.getBalance(true, function(balances){
            processor.process(board, balances);
        });
    });

    blanceMonitor.on('balance', function(boards){
        exchangeapi.getBalance(true, function(balances){
            balances.forEach(function(balance){
                var key = Object.keys(balance)[0];
                sendingAmount[key] = {
                    btc : balance[key].currencyAvailable,
                    eth : balance[key].assetAvailable
                };
                logger.lineNotification(key + "�̎c����\nBTC : " + tools.round(balance[key].currencyAvailable, 8) + "\nETH : " + tools.round(balance[key].assetAvailable, 8) + "\n�ł�");
            });
        });
    });

    processor.on('orderStream', function(order){
        agent.order(order); 
    });

    process.on('uncaughtException', function (err) {
        logger.lineNotification("���J�o���s�̃G���[���������܂����B�V�X�e���������I�����܂�\n" + err, function(finished){
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
