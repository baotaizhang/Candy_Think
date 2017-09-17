var _ = require('underscore');
var async = require('async');
var tools = require(__dirname + '/../util/tools.js');

var advisor = function(candyThink,candyRefresh, logger, setting, converter) {

    this.logger = logger;
    this.indicator = {};
    this.indicator.arbitrage = candyThink;
    this.indicator.refresh = candyRefresh;
    this.setting = setting;
    this.converter = converter;

  _.bindAll(this, 'update');

};

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(advisor, EventEmitter);
//---EventEmitter Setup

advisor.prototype.update = function(action, boards, balance, fiatRate, orderfaileds, callback) {

    // orderfailed can be left out
    if(typeof orderfaileds == "function") { 
        callback = orderfaileds;
        orderfailed = null;
    }

    // convert data with candyThink way.
    // ******************************************************************
    var candyThinkWay = this.convert(boards, balance, fiatRate);
    // ******************************************************************
    
    if(orderfaileds){
        var reorders = [];
        _.each(orderfaileds, function(orderfailed){
            this.indicator.arbitrage.orderRecalcurate(candyThinkWay.boards, candyThinkWay.balance, candyThinkWay.fee, orderfailed, function(err, reorder){
                if(err){
                    this.logger.lineNotification(err.message);
                }else if(reorder.length == 0){
                    
                }else{
                    Array.prototype.push.apply(reorders, reorder);
                }
            }.bind(this));
        }.bind(this));

        callback(_.flatten(reorders));

    }else if(action.action == 'think'){

        this.indicator.arbitrage.arbitrage(candyThinkWay.boards, candyThinkWay.balance, candyThinkWay.fee, function(orders, revenue){

            var estimatedRevenue = tools.round(revenue, 8);
            console.log('想定利益は' + estimatedRevenue + 'USDです');

            if(orders.length == 0){
                callback(new Array());
                this.emit('status', action);
            }else if(estimatedRevenue < 0){
                this.logger.lineNotification("利益額" + tools.round(revenue, 8) + "USDはリスク回避額" + this.setting.space + "USDに満たないため、オーダーは実施しません");
                this.emit('status', action);
                callback(new Array());
            }else if(orders && estimatedRevenue >= 0){
                callback(orders);
                this.logger.lineNotification("予想最高利益額は" + estimatedRevenue + "USDです");
            }else{
                throw "オーダーの形式に誤りがあります";
            }

        }.bind(this));

    }else if(action.action == 'refresh'){

        this.indicator.refresh.refresh(candyThinkWay.boards, candyThinkWay.balance, candyThinkWay.fee, this.setting.pair, function(orders, message){

            if(message && orders.length > 0){
                this.logger.lineNotification(message);
            }else{
                console.log(message);
            }

            if(orders.length == 0){
                this.emit('status', action);
                callback(new Array());
            }else if(orders.length > 0){
                callback(orders);
            }else{
                throw "オーダーの形式に誤りがあります";
            }
            
        
         }.bind(this));
    
    }else{

        throw "status形式に誤りがあります";

    }
};

module.exports = advisor;

