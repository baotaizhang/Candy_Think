var _ = require('underscore');
var tools = require(__dirname + '/../util/tools.js');

var candyRefresh = function(setting){

    _.bindAll(this,
        'refresh',
        'refreshpush',
        'orderclear'
    );

    this.candySettings = setting;
    this.pair;
    this.order = [];
    this.boards = {};
    this.balance = {};
    this.fee = {};
    this.buyExchange = [];
    this.sellExchange = [];

}

candyRefresh.prototype.refresh = function(boards,balance,fee,pair,callback){

    var pair_key = pair.split ("_")[0];
    var pair_settlement = pair.split ("_")[1];
    var balanceObj = {};
    var balancetotalObj = {};
    var orderObj = {};
    var ordertotalObj = {};
    var refreshBalanceAllocation = this.candySettings.refresh[pair].allocate;
    var message;

    this.pair = pair;
    this.balance = balance;
    this.fee = fee;
    this.orderclear();
    
    var eachPairBalance = _.groupBy(this.balance , function(obj){
        return obj.currency_code;
    });
    
    //calcurate total size
    _.each(eachPairBalance, function(eachPairBalancelist,pairtype){
        var total = 0;
        balanceObj[pairtype] = {};
        var balanceObjExchange = balanceObj[pairtype];
        _.each(eachPairBalancelist, function(balancelist,eachExchange){
            total = total + balancelist.amount;
            balanceObjExchange[balancelist.exchange] = balancelist.amount;
        })
        balancetotalObj[pairtype] = total; 
    });

    //calcurate balancesize
    _.each(balanceObj, function(eachBalanceObj,pairtype){
        var total = 0;
        orderObj[pairtype] = {};
        var orderObjExchange = orderObj[pairtype];
        var eachbalanceAllocations = refreshBalanceAllocation[pairtype];
        _.each(eachBalanceObj, function(eachBalanceObjlist,eachExchange){
            orderObjExchange[eachExchange] = balancetotalObj[pairtype] * eachbalanceAllocations[eachExchange] - eachBalanceObj[eachExchange] ;
            total = total + Math.abs(orderObjExchange[eachExchange]);
        });
        ordertotalObj[pairtype] = total;
    });

    //70%(setting)を超えたらbalancing
    if(balancetotalObj[pair_key] * this.candySettings.refresh[pair].bal_amt_percentage < ordertotalObj[pair_key]){
        _.each(orderObj[pair_key], function(keyCurrencyOrder,pairtype){
            if(keyCurrencyOrder > 0){
                this.buyExchange.push({
                    exchange:pairtype,
                    size : keyCurrencyOrder,
                    absSize : Math.abs(keyCurrencyOrder)
                });
            }else{
                this.sellExchange.push({
                    exchange:pairtype,
                    size : keyCurrencyOrder,
                    absSize : Math.abs(keyCurrencyOrder)
                });
            }
        }.bind(this));

        var boardsAsk = boards;
        boardsAsk_filter = 
            _.filter(boardsAsk, function(askboards){
                return (
                    askboards.ask_bid === "ask"
                    && askboards.amount <
                        _.max(
                            _.filter(boards, function(board){
                                return (
                                    board.ask_bid === "bid"
                                ) 
                            }),
                            function(bidboard){
                                return bidboard.amount;
                            }
                        ).amount
                ) 
            });
        _.each(this.sellExchange, function(sellOrder,consequesnce){
            boardsAsk_filter = _.reject(boardsAsk_filter, function(askboards){
                return (
                    askboards.exchange === sellOrder.exchange
                )
            })
        });
        boardsAsk_filter = _.sortBy(boardsAsk_filter, 'amount');

        var boardsBid = boards;
        if(_.size(boardsAsk_filter) !== 0){
            _.every(boardsAsk_filter, function(eachboardAsk){
                var boardsBid_filter = 
                    _.filter(boardsBid, function(bidboards){
                        return (
                            bidboards.ask_bid === "bid"
                            && bidboards.amount > eachboardAsk.amount
                            && bidboards.num > 0
                            && bidboards.exchange !== eachboardAsk.exchange
                        ) 
                    });
                boardsBid_filter = _.sortBy(boardsBid_filter, 'amount').reverse();
                _.each(this.buyExchange, function(buyOrder,consequesnce){
                    boardsBid_filter = _.reject(boardsBid_filter, function(bidboards){
                        return (
                            bidboards.exchange === buyOrder.exchange
                        )
                    })
                });
                
                if(_.size(boardsBid_filter) === 0){
                    return false
                }else{
                    _.every(boardsBid_filter, function(eachboardsBid){
                        var passnum = 0;
                        if(eachboardAsk.num > eachboardsBid.num ){
                            passnum = eachboardsBid.num;
                        }else if(eachboardAsk.num < eachboardsBid.num ){
                            passnum = eachboardAsk.num;
                        }else if(eachboardAsk.num === eachboardsBid.num ){
                            passnum = eachboardsBid.num;
                        }
                        if(passnum != 0){
                            this.refreshpush(eachboardAsk,eachboardsBid,passnum, function(actualnum){;
                                _.where(boardsBid, {no: eachboardsBid.no})[0].num = tools.floor(eachboardsBid.num - actualnum, 5);
                                eachboardAsk.num = tools.floor(eachboardAsk.num - tools.round(actualnum, 6), 6);
                                if(eachboardAsk.num <= 0){
                                    return false;
                                }
                            })
                        }
                        return true;
                    }.bind(this));
                    return true;
                }
            }.bind(this));
        }else{
            message = 'refreshの必要があるが、条件に合致するboardが存在しません。' + '\n' 
                    + '手動で送金するか条件に合致する板を待つ必要があります。' + '\n' 
                    + JSON.stringify(balanceObj,undefined,1);
        }
    }
    
    var ordersize = 0;
    _.each(this.order, function(orderlist,key){
        ordersize = ordersize + orderlist.size;
    }.bind(this));

    if(ordersize >= balancetotalObj[pair_key] * 0.99 && ordersize <= balancetotalObj[pair_key] * 1.01){
        message = 'refreshの必要があります。条件に合致するboardが存在したため、refreshを行います。' + '\n' + JSON.stringify(ordertotalObj,undefined,1);
    }else if(ordersize != 0){
        message = 'refreshの必要があります。一部のみrefreshを行います。下記原因により一部となっています。' + '\n'
                + '・refreshPercentage(' + this.candySettings.refresh[this.pair].percentage_from + '~' + this.candySettings.refresh[this.pair].percentage_to + ')に合致する板が少ないor存在しない' + '\n'
                + '・残高が不足している *念のため、残高を確認してください。' + '\n'
                + 'ordersize:' + ordersize + '\n'
                + JSON.stringify(ordertotalObj,undefined,1);
    }else if(this.order.length > 0){
        message = 'refreshの必要がありますがrefreshの条件に合致しません。下記いずれかの問題です。' + '\n'
                + '・refreshPercentage(' + this.candySettings.refresh[this.pair].percentage_from + '~' + this.candySettings.refresh[this.pair].percentage_to + ')に合致する板が少ないor存在しない' + '\n'
                + '・残高が不足している *念のため、残高を確認してください。' + '\n'
    }
    callback(this.order, message);
}

candyRefresh.prototype.refreshpush = function(eachboardAsk,eachboardBid,num,cb){
    var actualnum = 0;
    var buyExchangeSize = _.where(this.buyExchange, {exchange: eachboardAsk.exchange})[0].absSize;
    var sellExchangeSize = _.where(this.sellExchange, {exchange: eachboardBid.exchange})[0].absSize;
    if(num <= buyExchangeSize && num <= buyExchangeSize){
        actualnum = num;
    }else if(buyExchangeSize <= num && buyExchangeSize <= sellExchangeSize){
        actualnum = buyExchangeSize;
    }else if(sellExchangeSize <= num && sellExchangeSize <= buyExchangeSize){
        actualnum = sellExchangeSize;
    }

    var balance_ask = _.where(this.balance, {currency_code: eachboardAsk.product_code.split ("_")[1],exchange : eachboardAsk.exchange});
    var balance_bid = _.where(this.balance, {currency_code: eachboardBid.product_code.split ("_")[0],exchange : eachboardBid.exchange});
    var fee_ask = _.where(this.fee, {exchange: eachboardAsk.exchange})[0].fee / 100;
    var fee_bid = _.where(this.fee, {exchange: eachboardBid.exchange})[0].fee / 100;
    var commission_ask_settlement = tools.round(eachboardAsk.amount * actualnum * fee_ask, 7);
    var commission_bid_settlement = tools.round(eachboardBid.amount * actualnum * fee_bid, 7);
    var commission_ask_key = tools.round(eachboardAsk.amount * actualnum * fee_ask / eachboardAsk.amount, 7);
    var commission_bid_key = tools.round(eachboardBid.amount * actualnum * fee_bid / eachboardBid.amount, 7);
    var cost_ask = eachboardAsk.amount * actualnum + commission_ask_settlement;

    var ask_profit = eachboardAsk.amount * actualnum;
    var bid_profit = eachboardBid.amount * actualnum - commission_ask_settlement - commission_bid_settlement;
    var refresh_actual_percentage = bid_profit / ask_profit;
    var refresh_percentage_from = this.candySettings.refresh[this.pair].percentage_from;
    var refresh_percentage_to = this.candySettings.refresh[this.pair].percentage_to;
    if((refresh_actual_percentage >= refresh_percentage_from) && (refresh_actual_percentage < refresh_percentage_to)){
        if(balance_ask[0].amount >= cost_ask && balance_bid[0].amount >= actualnum && actualnum > 0.01){
            ask_order = 
                {
                    result : "BUY",
                    exchange : eachboardAsk.exchange,
                    price: eachboardAsk.amount,
                    size: actualnum,
                    time : eachboardAsk.time,
                    pair : eachboardAsk.product_code,
                    commission_settlement_pre : commission_ask_settlement,
                    commission_key_pre : commission_ask_key,
                    refresh : "refresh"
                }
            bid_order = 
                {
                    result : "SELL",
                    exchange : eachboardBid.exchange,
                    price: eachboardBid.amount,
                    size: actualnum,
                    time : eachboardAsk.time,
                    pair : eachboardBid.product_code,
                    commission_settlement_pre : commission_bid_settlement,
                    commission_key_pre : commission_bid_key,
                    refresh : "refresh"
                }
            this.order.push(ask_order);
            this.order.push(bid_order);
            _.where(this.balance, {currency_code: eachboardAsk.product_code.split ("_")[1],exchange : eachboardAsk.exchange})[0].amount = balance_ask[0].amount - cost_ask;
            _.where(this.balance, {currency_code: eachboardBid.product_code.split ("_")[0],exchange : eachboardBid.exchange})[0].amount = balance_bid[0].amount - actualnum;
            _.where(this.buyExchange, {exchange: eachboardAsk.exchange})[0].absSize = buyExchangeSize - actualnum;
            _.where(this.sellExchange, {exchange: eachboardBid.exchange})[0].absSize = sellExchangeSize - actualnum;
        }
    }
    cb(actualnum);
}

candyRefresh.prototype.orderclear = function(){
    this.order.length = 0;
}

module.exports = candyRefresh;