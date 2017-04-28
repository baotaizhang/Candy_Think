var _ = require('underscore');


var candyThink = function(storage){

    this.storage = storage;

    _.bindAll(this,
        'arbitrage',
        'orderpush',
        'orderclear'
    );

    this.order = [];

}

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(candyThink, EventEmitter);
//---EventEmitter Setup

/* arbitrage 
** 5分に1回全ての板情報を計算する。都度計算は行わない。
*/
candyThink.prototype.arbitrage = function(boards){

    //order情報の初期値をセット
    var order = null
    //1.ask(売注文 =買える)算出
    var boardsAsk = boards;
    //filter ask Board
    var boardsAsk_filter = 
        _.filter(boardsAsk, function(askboards){
            return (
                //askのデータを抽出
                askboards.ask_bid == "ask"
                //bidのmax値 > askのamountを抽出
                && askboards.amount <
                    _.max(
                        //firstArgument:list bidで絞り込んだboard
                        _.filter(boards, function(boards){
                            return (boards.ask_bid == "bid") 
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
    if(_.size(boardsAsk_filter) == 0){
        order = null
    }else{
        _.every(boardsAsk_filter, function(eachboardAsk){
            //2.1.bid算出
            var boardsBid_filter = 
                _.filter(boardsBid, function(bidboards){
                    return (
                        //bidのデータを抽出
                        bidboards.ask_bid == "bid"
                        //bidのamout > 1.ask(売注文 =買える)算出で取得したamountを抽出
                        && bidboards.amount > eachboardAsk.amount
                    ) 
                });
            //order by desc of amount
            boardsBid_filter = _.sortBy(boardsBid_filter, 'amount').reverse();
            if(_.size(boardsBid_filter) == 0){
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
                    }else if(eachboardAsk.num == eachboardsBid.num ){
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

    // orderがなければnullをorderにセット
    this.emit('update', this.order);

/* いくらの売り買いか確認
    var price_buy = 0;
    var num_buy = 0;
    _.each(_.where(this.order, {side: "BUY"}),function(buylist,key){
        price_buy = price_buy + buylist.price * buylist.size;
        num_buy = num_buy + buylist.size;
    });
    var price_sell = 0;
    var num_sell = 0;
    _.each(_.where(this.order, {side: "SELL"}),function(selllist,key){
        price_sell = price_buy + selllist.price * selllist.size;
        num_sell = num_sell + selllist.size;
    });
    console.log("price_buy:"+price_buy + "    num_buy:" + num_buy);
    console.log("price_sell:"+price_sell + "    num_sell:" + num_sell);
    console.log("total:"+(price_sell-price_buy));
*/

    //orderをclear
    this.orderclear();

}


/* orderpush 
** orderを追加
*/
candyThink.prototype.orderpush = function(eachboardAsk,eachboardsBid,num){

    var ask_order = 
        {
            exchange : eachboardAsk.exchange,
            child_order_type: "LIMIT",
            side: "BUY",
            price: eachboardAsk.amount,
            size: num,
            minute_to_expire: 0,
            time_in_force: "GTC"
        }
    var bid_order = 
        {
            exchange : eachboardsBid.exchange,
            child_order_type: "LIMIT",
            side: "SELL",
            price: eachboardsBid.amount,
            size: num,
            minute_to_expire: 0,
            time_in_force: "GTC"
        }
    this.order.push(ask_order);
    this.order.push(bid_order);

}

/* orderclear
** orderをclear
*/
candyThink.prototype.orderclear = function(){

    this.order.length = 0;

}

module.exports = candyThink;
