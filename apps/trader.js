var _ = require('underscore');
var async = require('async');
var moment = require('moment');
var execSync = require('child_process').execSync;
var tools = require(__dirname + '/../util/tools.js');

var firebaseService = require(__dirname + '/../services/firebase.js');
var processorService = require(__dirname + '/../services/processor.js');
var loggingservice = require(__dirname + '/../services/loggingservice.js');
var tradingadvisor = require(__dirname + '/../services/advisor.js');
var exchangeapiService = require(__dirname + '/../services/exchangeapi.js');
var agentService = require(__dirname + '/../services/agent.js');
var candyThinkOBJ = require(__dirname + '/../indicator/candyThink.js');
var candyRefreshOBJ = require(__dirname + '/../indicator/candyRefresh.js');

var config = require(__dirname + '/../config.js');
var candyConfig = config.init();
var setting = require('../setting.js');

var logger = new loggingservice('trader');
var candyThink = new candyThinkOBJ(setting);
var candyRefresh = new candyRefreshOBJ(setting); 
var advisor = new tradingadvisor(candyThink, candyRefresh ,logger, setting);
var firebase = new firebaseService(candyConfig, setting);
var processor = new processorService(advisor, logger);
var exchangeapi = new exchangeapiService(candyConfig, logger, setting);
var agent = new agentService(firebase, setting);

var trader = function(){

   firebase.on('systemStream',function(system){
       if(system == 'stop'){
           logger.lineNotification("緊急停止が選択されました。システムを停止します", function(finished){
               finished();
               var result =  execSync('forever stop candy.js');
           });
       }else if(system == 'idle'){
           logger.lineNotification("アイドリングモードで待機します", function(finished){
               firebase.disconnect();
               finished();
           });
       }else if(system == 'running'){
           logger.lineNotification("取引を開始します", function(finished){
               firebase.trading();
               firebase.orderFailedConnection();
               firebase.orderFailedCount();
               finished();
           });
       }else{
           throw "不正なモードが選択されています";
       }
   });

   firebase.on('orderFailedStream', function(orderFailed){
       processor.process('orderFailed', orderFailed, exchangeapi);
   });

   firebase.on('tradeStream', function(tradeStatus){
       if(moment().diff(tradeStatus.time, 'seconds') < 1000 * 60){
           if(tradeStatus.system == 'think'){
               processor.process('refresh', null, exchangeapi);
           }else if(tradeStatus.system == 'refresh'){
               processor.process('think', null, exchangeapi);
          }else{
               throw "想定外のtradeStatus : " + tradeStatus.system + "を検知したため、システムを停止します"
           }
        }else{
           logger.lineNotification("新しいtradeStatus :" + tradeStatus.system + "　を検知しましたが、更新時間："
               + tradeStatus.time + "が現在時刻：" + moment().format("YYYY-MM-DD HH:mm:ss") + "より一分以上遅いため、実行しません" , function(finished){
               finished();
           });
        }
   })

   processor.on('orderStream', function(order){
       agent.order(order); 
   });

   advisor.on('status', function(action){
       firebase.statusUpdate(action);
   })

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
   firebase.systemConnection();
};

var traderApp = new trader();

module.exports = traderApp;
