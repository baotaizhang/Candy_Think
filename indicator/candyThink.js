var _ = require('underscore');


var candyThink = function(){

    _.bindAll(this,
        'arbitrage',
        'orderpush',
        'orderclear'
    );

    this.order = [];
    this.balance = {};
    this.fee = {};

}

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(candyThink, EventEmitter);
//---EventEmitter Setup

/* arbitrage 
** 5分に1回全ての板情報を計算する。都度計算は行わない。
*/
candyThink.prototype.arbitrage = function(boards,balance,fee,callback){
    var candySetting = 
    { 
        arbitrage: { delay: 60, ownexchange: 0, spread: 10 },
        backTesterSettings: { initialAssetBalance: 0, initialCurrencyBalance: 0 },
        debug: true,
        exchangeSettings: { exchanges: [ 'craken', 'bitflyer' ] },
        'tradingEnabled ': false,
        name: 'settings'
    };
    this.balance = balance;
    this.fee = fee;
    //1.ask(売注文 =買える)算出
    var boardsAsk = boards;
    //filter ask Board
    var boardsAsk_filter = 
        _.filter(boardsAsk, function(askboards){
            return (
                //askのデータを抽出
                askboards.ask_bid === "ask"
                //bidのmax値 > askのamountを抽出
                && askboards.amount <
                    _.max(
                        //firstArgument:list bidで絞り込んだboard
                        _.filter(boards, function(board){
                            return (board.ask_bid === "bid") 
                        }),
                        //関数内のreturnで返した値(amount)を軸として最大値だったオブジェクトを返す。
                        function(bidboard){
                            return bidboard.amount;
                        }
                    ).amount
            ) 
        });
    //order by asc of amount
    boardsAsk_filter = _.sortBy(boardsAsk_filter, 'amount');

    //2.ask_bid比較
    var boardsBid = boards;
    if(_.size(boardsAsk_filter) !== 0){
        _.every(boardsAsk_filter, function(eachboardAsk){
            //2.1.bid(売れる)算出
            if(candySetting.arbitrage.ownexchange === 0){
                var boardsBid_filter = 
                    _.filter(boardsBid, function(bidboards){
                        var bid_fee = _.where(fee, {exchange_type: bidboards.exchange_type})[0].fee;
                        var ask_fee = _.where(fee, {exchange_type: eachboardAsk.exchange_type})[0].fee;
                        return (
                            //bidのデータを抽出
                            bidboards.ask_bid === "bid"
                            //bid(売れる)のamout > 1.ask(売注文 =買える)算出で取得したamountを抽出(taker手数料も考慮)
                            && (bidboards.amount * (100 - bid_fee)) > (eachboardAsk.amount * (100 + ask_fee))
                            //自身の取引所は含めない(ownexchange === 0の場合)
                            && bidboards.exchange_type !== eachboardAsk.exchange_type
                        ) 
                    });
            }else{
                var boardsBid_filter = 
                    _.filter(boardsBid, function(bidboards){
                        return (
                            //bidのデータを抽出
                            bidboards.ask_bid === "bid"
                            //bidのamout > 1.ask(売注文 =買える)算出で取得したamountを抽出
                            && bidboards.amount > eachboardAsk.amount
                        ) 
                    });
            }
            //order by desc of amount
            boardsBid_filter = _.sortBy(boardsBid_filter, 'amount').reverse();
            if(_.size(boardsBid_filter) === 0){
                return false
            }else{
                _.every(boardsBid_filter, function(eachboardsBid){
                    if(eachboardAsk.num > eachboardsBid.num ){
                    
                        //①-1 Order : 2.1.bid算出で算出したデータの売注文(bidを売る)をテーブルに登録する
                        //①-2 Order : 1.ask算出で算出したデータの買注文(askを買う)をテーブルに登録する(売注文(bid)と同じ量)
                        this.orderpush(eachboardAsk,eachboardsBid,eachboardsBid.num);
                        
                        //②bidのamout = 0 に更新  次の"2.1.bid算出"時に条件にかからないようにamount = 0とする
                        _.where(boardsBid, {no: eachboardsBid.no})[0].amount = 0;
                        
                        //③[ask_num] = [ask_num] - [bid_num]
                        eachboardAsk.num = eachboardAsk.num - eachboardsBid.num;
                        
                    }else if(eachboardAsk.num < eachboardsBid.num ){
                    
                        //①-1 Order : 1.ask算出で算出したデータの買注文(askを買う)をテーブルに登録する
                        //①-1 Order : 2.1.bid算出で算出したデータの売注文(bidを売る)をテーブルに登録する(買注文(ask)と同じ量)
                        this.orderpush(eachboardAsk,eachboardsBid,eachboardAsk.num);
                        
                        //②bidのnum =  [bid_num] - [ask_num] に更新
                        _.where(boardsBid, {no: eachboardsBid.no})[0].num = eachboardsBid.num - eachboardAsk.num;
                        
                        //break this loop
                        return false;
                    }else if(eachboardAsk.num === eachboardsBid.num ){
                        //①-1 Order : 2.1.bid算出で算出したデータの売注文(bidを売る)をテーブルに登録する
                        //①-2 Order : 1.ask算出で算出したデータの買注文(askを買う)をテーブルに登録する(売注文(bid)と同じ量)
                        this.orderpush(eachboardAsk,eachboardsBid,eachboardsBid.num);
                        
                        //②bidのamout = 0 に更新  次の"2.1.bid算出"時に条件にかからないようにamount = 0とする
                        _.where(boardsBid, {no: eachboardsBid.no})[0].amount = 0;
                        
                        //break this loop
                        return false;
                    }
                    return true;
                }.bind(this));
                return true;
            }
        }.bind(this));
    }

// いくらの売り買いか確認

    var price_buy = 0;
    var num_buy = 0;
    _.each(_.where(this.order, {result: "BUY"}),function(buylist,key){
        price_buy = price_buy + buylist.price * buylist.size;
        num_buy = num_buy + buylist.size;
    });
    var price_sell = 0;
    var num_sell = 0;
    _.each(_.where(this.order, {result: "SELL"}),function(selllist,key){
        price_sell = price_sell + selllist.price * selllist.size;
        num_sell = num_sell + selllist.size;
    });

    // orderがなければnullをorderにセット
    callback(this.order, price_sell-price_buy);

    //orderをclear
    this.orderclear();
}


/* orderpush 
** orderを追加
*/
candyThink.prototype.orderpush = function(eachboardAsk,eachboardBid,num){

    var balance_ask = _.where(this.balance, {currency_code: eachboardAsk.product_code.split ("_")[1],exchange : eachboardAsk.exchange});
    var balance_bid = _.where(this.balance, {currency_code: eachboardBid.product_code.split ("_")[0],exchange : eachboardBid.exchange});

    var cost_ask = eachboardAsk.amount * num;
    var num_order = 0;
    var calucrate = 0;
    var ask_order = [];
    var bid_order = [];
    if((balance_ask[0].amount > 0 && balance_bid[0].amount > 0) && (balance_ask[0].amount >= cost_ask && balance_bid[0].amount >= num)){
        num_order = num;
        calucrate = 1;
        _.where(this.balance, {currency_code: eachboardAsk.product_code.split ("_")[1],exchange : eachboardAsk.exchange})[0].amount = balance_ask[0].amount - cost_ask;
        _.where(this.balance, {currency_code: eachboardBid.product_code.split ("_")[0],exchange : eachboardBid.exchange})[0].amount = balance_bid[0].amount - num;
    }else if((balance_ask[0].amount > 0 && balance_bid[0].amount > 0) && (balance_ask[0].amount < cost_ask && balance_bid[0].amount >= num)){
        num_order = balance_ask[0].amount / eachboardAsk.amount;
        calucrate = 1;
        _.where(this.balance, {currency_code: eachboardAsk.product_code.split ("_")[1],exchange : eachboardAsk.exchange})[0].amount = 0;
        _.where(this.balance, {currency_code: eachboardBid.product_code.split ("_")[0],exchange : eachboardBid.exchange})[0].amount = balance_bid[0].amount - num_order;
    }else if((balance_ask[0].amount > 0 && balance_bid[0].amount > 0) && (balance_ask[0].amount >= cost_ask && balance_bid[0].amount < num) ){
        num_order = balance_bid[0].amount;
        calucrate = 1;
        _.where(this.balance, {currency_code: eachboardAsk.product_code.split ("_")[1],exchange : eachboardAsk.exchange})[0].amount = balance_ask[0].amount - (eachboardAsk.amount * num_order);
        _.where(this.balance, {currency_code: eachboardBid.product_code.split ("_")[0],exchange : eachboardBid.exchange})[0].amount = 0;
    }
    //console.log(this.balance);
    if(calucrate === 1 && num_order <= num){
        ask_order = 
            {
                result : "BUY",
                exchange : eachboardAsk.exchange,
                price: eachboardAsk.amount,
                size: num_order,
                time : eachboardAsk.time
            }
        bid_order = 
            {
                result : "SELL",
                exchange : eachboardBid.exchange,
                price: eachboardBid.amount,
                size: num_order,
                time : eachboardAsk.time
            }
        this.order.push(ask_order);
        this.order.push(bid_order);
    }

}

/* orderclear
** orderをclear
*/
candyThink.prototype.orderclear = function(){

    this.order.length = 0;

}

module.exports = candyThink;
