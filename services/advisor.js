var _ = require('underscore');
var async = require('async');
var tools = require(__dirname + '/../util/tools.js');

var advisor = function(candyThink,candyRefresh, logger, setting) {

    this.logger = logger;
    this.indicator = {};
    this.indicator.arbitrage = candyThink;
    this.indicator.refresh = candyRefresh;
    this.setting = setting;

  _.bindAll(this, 'update');

};

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(advisor, EventEmitter);
//---EventEmitter Setup

advisor.prototype.update = function(action, boards, balance, fiatRate, orderfailed, callback) {

    // orderfailed can be left out
    if(typeof orderfailed == "function") { 
        callback = orderfailed;
        orderfailed = null;
    }

    // convert data with candyThink way.
    // ******************************************************************
    var candyThinkWay = convert(boards, balance, fiatRate, this.setting);
    // ******************************************************************
    
    if(orderfailed){
        this.indicator.arbitrage.orderRecalcurate(candyThinkWay.boards, candyThinkWay.balance, candyThinkWay.fee, boards[0].orderfailed, function(err, reorder){
            if(err){
                throw err.message;
            }else if(reorder.length == 0){
                 callback(new Array());
            }else{
                callback(reorder);
            }
        });
    }else if(action == 'think'){

        this.indicator.arbitrage.arbitrage(candyThinkWay.boards, candyThinkWay.balance, candyThinkWay.fee, function(orders, revenue){

            var estimatedRevenue = tools.round(revenue, 8);
            console.log('想定利益は' + estimatedRevenue + 'BTCです');

            if(orders.length == 0){
                callback(new Array());
                this.emit('status', action);
            }else if(estimatedRevenue < 0){
                this.logger.lineNotification("利益額" + tools.round(revenue, 8) + "BTCはリスク回避額" + this.setting.space + "BTCに満たないため、オーダーは実施しません");
                this.emit('status', action);
                callback(new Array());
            }else if(orders && estimatedRevenue >= 0){
                callback(orders);
                this.logger.lineNotification("予想最高利益額は" + estimatedRevenue + "BTCです");
            }else{
                throw "オーダーの形式に誤りがあります";
            }

        }.bind(this));

    }else if(action == 'refresh'){

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

var formatUSD = function(amount, ask_bid, asset, fiatRate){
    var target = _.find(fiatRate.quotes, function(fiat){
        return fiat.currencyPairCode == "USDJPY";
    });

    if(asset == "JPY"){
        amount = amount / target[ask_bid];
    };

    return amount;
}
    


var convert = function(groupedBoards, balances, fiatRate, setting){

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
            currency_code : setting.currency,
            //amount : formatUSD(balance[key].currencyAvailable, "ask", setting[key].currency, fiatRate)
            amount : 1000000

        });

        candyThinkWay.balance.push({
        
            exchange_type : exchange_type_count,
            exchange : key,
            currency_code : setting.asset,
            //amount : formatUSD(balance[key].assetAvailable, "ask", setting[key].asset, fiatRate)
            amount : 1000000
        
        });

        candyThinkWay.fee.push({

            exchange_type:exchange_type_count,
            exchange: key,
            fee: balance[key].fee

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
                        amount : formatUSD(order.price, ask_bid.substr(0,3), setting[board.exchange].asset, fiatRate),
                        actualAmount : order.price,
                        product_code : setting.pair,
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
                        actualAmount : order[0],
                        product_code : setting.pair,
                        time : board.time
                    })
                }else if(board.exchange === 'poloniex'){

                    candyThinkWay.boards.push({
                        no : no++,
                        exchange_type : 3,
                        exchange : board.exchange,
                        ask_bid : ask_bid.substr(0,3),
                        num : order[1],
                        amount : order[0],
                        actualAmount : order[0],
                        product_code : setting.pair,
                        time : board.time
                    })

                }
           });
        });
    });
    return candyThinkWay;
};

module.exports = advisor;

