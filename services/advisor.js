var _ = require('underscore');
var async = require('async');
var candyThinkOBJ = require(__dirname + '/../indicator/candyThink.js');
var tools = require(__dirname + '/../util/tools.js');

var candyThink = new candyThinkOBJ();

var advisor = function(logger, setting) {

    this.logger = logger;
    this.indicator = candyThink;
    this.setting = setting;

  _.bindAll(this, 'update');

};

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(advisor, EventEmitter);
//---EventEmitter Setup

advisor.prototype.update = function(boards, balance, callback) {

    // convert data with candyThink way.
    // ******************************************************************
    var candyThinkWay = convert(boards, balance);
    // ******************************************************************
    
    if(candyThinkWay.boards.length == 1){
        //再オーダー作成
    
    }else if(candyThinkWay.boards.length <= 2){

        this.indicator.arbitrage(candyThinkWay.boards, candyThinkWay.balance, candyThinkWay.fee, function(orders, revenue){

            var estimatedRevenue = tools.round(revenue - this.setting.space, 8);

            if(orders.length == 0){
                callback(new Array());
            }else if(estimatedRevenue < 0){
                this.logger.lineNotification("利益額 + "tools.round(revenue, 8) + "BTCはリスク回避額" + this.setting.space + "BTCに満たないため、オーダーは実施しません");
                callback(new Array());
            }else if(orders && estimatedRevenue >= 0){
                callback(orders);
                this.logger.lineNotification("予想最高利益額は" + estimatedRevenue + "BTCです");
            }else{
                throw "オーダーの形式に誤りがあります";
            }

        }

    }else{

        throw "boardの形式に誤りがあります";

    }.bind(this));
};

var convert = function(groupedBoards, balances){

    var candyThinkWay = {
    
        balance : [],
        boards : [],
        fee : []

    };

    var exchange_type_count = 1;

    balances.forEach(function(balance){
    
        var key = Object.keys(balance)[0];
        
        candyThinkWay.balance.push({
        
            exchange_type : exchange_type_count,
            exchange : key,
            currency_code : this.setting.currency,
            amount : balance[key].currencyAvailable

        });

        candyThinkWay.balance.push({
        
            exchange_type : exchange_type_count,
            exchange : key,
            currency_code : this.setting.asset,
            amount : balance[key].assetAvailable
        
        });

        candyThinkWay.fee.push({

            exchange_type:exchange_type_count,
            exchange: key,
            fee: key == 'bitflyer' ? balance[key].fee * 100 : balance[key].fee

        });

        exchange_type_count++;
    
    });

    var candyThinkBoards = [];
    var no = 0;

    groupedBoards.forEach(function(board){
        _.each(_.pick(board, 'asks', 'bids'),function(orders, ask_bid){
            orders.forEach(function(order){          
                
                if(board.exchange === 'bitflyer'){
                    candyThinkWay.boards.push({
                        no : no++,
                        exchange_type : 1,
                        exchange : board.exchange,
                        ask_bid : ask_bid.substr(0,3),
                        num : order.size,
                        amount : order.price,
                        product_code : this.setting.pair,
                        time : board.time
                    })

                }else if(board.exchange === 'kraken'){

                    candyThinkWay.boards.push({
                        no : no++,
                        exchange_type : 2,
                        exchange : board.exchange,
                        ask_bid : ask_bid.substr(0,3),
                        num : order[1],
                        amount : order[0],
                        product_code : this.setting.pair,
                        time : board.time
                    })
                }

           });
        });
    });
    return candyThinkWay;
};

module.exports = advisor;
