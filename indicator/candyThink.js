var _ = require('underscore');
var tools = require(__dirname + '/../util/tools.js');

var candyThink = function(setting){

    _.bindAll(this,
        'arbitrage',
        'orderRecalcurate',
        'orderpush',
        'orderclear'
    );

    this.candySettings = setting;
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

    this.balance = balance;
    this.fee = fee;
    //orderをclear
    this.orderclear();
    //再オーダーでBUYが高くなることを想定して、残高を95%に変更する。
    _.each(this.balance, function(balancelist,key){
        balancelist.amount = balancelist.amount * 0.95;
    }.bind(this));
    
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
            var boardsBid_filter = 
                _.filter(boardsBid, function(bidboards){
                    var bid_fee = _.where(fee, {exchange: bidboards.exchange})[0].fee;
                    var ask_fee = _.where(fee, {exchange: eachboardAsk.exchange})[0].fee;
                    return (
                        //bidのデータを抽出
                        bidboards.ask_bid === "bid"
                        //bid(売れる)のamout > 1.ask(売注文 =買える)算出で取得したamountを抽出(taker手数料も考慮)
                        && (bidboards.amount) > (eachboardAsk.amount)
                        //自身の取引所は含めない(ownexchange === 0の場合)
                        && bidboards.exchange !== eachboardAsk.exchange
                    ) 
                });
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
    _.each(_.where(this.order, {result: "BUY"}),function(buylist,key){
        price_buy = price_buy + ((buylist.price * buylist.size) + (buylist.price * buylist.size * _.where(this.fee, {exchange: buylist.exchange})[0].fee/100));
    }.bind(this));
    var price_sell = 0;
    _.each(_.where(this.order, {result: "SELL"}),function(selllist,key){
        price_sell = price_sell + ((selllist.price * selllist.size) - (selllist.price * selllist.size * _.where(this.fee, {exchange: selllist.exchange})[0].fee/100));
    }.bind(this));

    // orderがなければnullをorderにセット
    callback(this.order, price_sell - price_buy);

    //orderをclear
    this.orderclear();
}


/* orderpush 
** orderを追加
*/
candyThink.prototype.orderpush = function(eachboardAsk,eachboardBid,num){

    var balance_ask = _.where(this.balance, {currency_code: eachboardAsk.product_code.split ("_")[1],exchange : eachboardAsk.exchange});
    var balance_bid = _.where(this.balance, {currency_code: eachboardBid.product_code.split ("_")[0],exchange : eachboardBid.exchange});

    //手数料の%
    var fee_ask = _.where(this.fee, {exchange: eachboardAsk.exchange})[0].fee / 100;
    var fee_bid = _.where(this.fee, {exchange: eachboardBid.exchange})[0].fee / 100;

    //決済通貨での手数料
    var commission_ask_settlement = eachboardAsk.amount * num * fee_ask;
    var commission_bid_settlement = eachboardBid.amount * num * fee_bid;
    //基軸通貨での手数料
    var commission_ask_key = eachboardAsk.amount * num * fee_ask / eachboardAsk.amount;
    var commission_bid_key = eachboardBid.amount * num * fee_bid / eachboardBid.amount;

    //cost_ask:BUYする決済通貨の金額(amount*size) - 手数料
    var cost_ask = eachboardAsk.amount * num + commission_ask_settlement;

    var num_order = 0;
    var calcurate = 0;
    var ask_order = [];
    var bid_order = [];

    if(balance_ask[0].amount > 0 && balance_bid[0].amount > 0){
        //両方の取引所で残高に余裕のあるケース
        if(balance_ask[0].amount >= cost_ask && balance_bid[0].amount >= num){
            //板情報通りにオーダーを行う
            num_order = num;
            calcurate = 1;
            _.where(this.balance, {currency_code: eachboardAsk.product_code.split ("_")[1],exchange : eachboardAsk.exchange})[0].amount = balance_ask[0].amount - cost_ask;
            _.where(this.balance, {currency_code: eachboardBid.product_code.split ("_")[0],exchange : eachboardBid.exchange})[0].amount = balance_bid[0].amount - num;
        //ask(BUY)の取引所で残高が足りない and bid(SELL)の取引所で残高が足りているケース
        }else if(balance_ask[0].amount < cost_ask && balance_bid[0].amount >= num){
            //(ask(BUY)の残高 / 板情報の金額)分のsizeでオーダーを行う
            num_order = tools.floor(balance_ask[0].amount / eachboardAsk.amount, 7);
            calcurate = 1;
            _.where(this.balance, {currency_code: eachboardAsk.product_code.split ("_")[1],exchange : eachboardAsk.exchange})[0].amount = 0;
            _.where(this.balance, {currency_code: eachboardBid.product_code.split ("_")[0],exchange : eachboardBid.exchange})[0].amount = balance_bid[0].amount - num_order;
        //ask(BUY)の取引所で残高が足りていて and bid(SELL)の取引所で残高が足りていないケース
        }else if(balance_ask[0].amount >= cost_ask && balance_bid[0].amount < num){
            //bid(SELL)の残高分のsizeでオーダーを行う
            num_order = balance_bid[0].amount;
            calcurate = 1;
            _.where(this.balance, {currency_code: eachboardAsk.product_code.split ("_")[1],exchange : eachboardAsk.exchange})[0].amount = balance_ask[0].amount - ((eachboardAsk.amount * num_order) + eachboardAsk.amount * num_order * fee_ask);
            _.where(this.balance, {currency_code: eachboardBid.product_code.split ("_")[0],exchange : eachboardBid.exchange})[0].amount = 0;
        }
    }

    if(calcurate === 1 && num_order <= num){
        //num_orderで手数料を再計算(決済通貨での手数料)
        commission_ask_settlement = eachboardAsk.amount * num_order * fee_ask;
        commission_bid_settlement = eachboardBid.amount * num_order * fee_bid;
        //num_orderで手数料を再計算(基軸通貨での手数料)
        commission_ask_key = eachboardAsk.amount * num_order * fee_ask / eachboardAsk.amount;
        commission_bid_key = eachboardBid.amount * num_order * fee_bid / eachboardBid.amount;
        //利益を考慮した約定金額
        var ask_profit = eachboardAsk.amount * num_order;
        var bid_profit = eachboardBid.amount * num_order - commission_ask_settlement - commission_bid_settlement;
        //1%以上の利益率 and 0.005BTC以上
        var profit_percentage = this.candySettings.profit[eachboardAsk.product_code].profit_percentage;
        var profit_sum = this.candySettings.profit[eachboardAsk.product_code].profit_sum;
        
        if( (bid_profit / ask_profit > profit_percentage) 
          && (bid_profit - ask_profit) > profit_sum ){
            ask_order = 
                {
                    result : "BUY",
                    exchange : eachboardAsk.exchange,
                    price: eachboardAsk.amount,
                    size: num_order,
                    time : eachboardAsk.time,
                    pair : eachboardAsk.product_code,
                    commission_settlement_pre : commission_ask_settlement,
                    commission_key_pre : commission_ask_key
                }
            bid_order = 
                {
                    result : "SELL",
                    exchange : eachboardBid.exchange,
                    price: eachboardBid.amount,
                    size: num_order,
                    time : eachboardAsk.time,
                    pair : eachboardBid.product_code,
                    commission_settlement_pre : commission_bid_settlement,
                    commission_key_pre : commission_bid_key
                }
            this.order.push(ask_order);
            this.order.push(bid_order);
        }
    }

}

candyThink.prototype.orderRecalcurate = function(boards,balance,fee,orderFailed,callback){
    var boards_reorder;
    var balance_conf;
    
    if(orderFailed.result === 'SELL'){
        boards_reorder = 
            _.filter(boards, function(sellboards){
                    return (
                        //bidのデータを抽出
                        sellboards.ask_bid === "bid"
                        && sellboards.exchange === orderFailed.exchange
                    )
            });
        var test = _.where(boards, {ask_bid: "bid", exchange : orderFailed.exchange});
        //order by desc of amount
        boards_reorder = _.sortBy(boards_reorder, 'amount').reverse();
        balance_conf = _.where(balance, {currency_code: orderFailed.pair.split ("_")[0],exchange : orderFailed.exchange})[0].amount;
    }else{
        boards_reorder = 
            _.filter(boards, function(buyboards){
                    return (
                        //bidのデータを抽出
                        buyboards.ask_bid === "ask"
                        && buyboards.exchange === orderFailed.exchange
                    )
            });
        //order by ask of amount
        boards_reorder = _.sortBy(boards_reorder, 'amount');
        balance_conf = _.where(balance, {currency_code: orderFailed.pair.split ("_")[1],exchange : orderFailed.exchange})[0].amount;
    }

    //再orderの配列
    var reorder = [];
    //再orderの数量
    var num = (Number(orderFailed.size) * 1000000 - Number(orderFailed.size_exec) * 1000000) / 1000000;
    //板情報のfor文
    _.every(boards_reorder, function(eachboards){
        var num_exec = num;
        var reorder_posssible = 0;
        if(eachboards.num <= num){
            num_exec = eachboards.num;
        }
        var fee_settlement = eachboards.amount * num_exec;
        var commission_settlement_pre = fee_settlement * _.where(fee, {exchange: eachboards.exchange})[0].fee / 100;
        var commission_key_pre = fee_settlement * _.where(fee, {exchange: eachboards.exchange})[0].fee / 100 / eachboards.amount;
        //残高の確認
        if(orderFailed.result === 'SELL'){
            if(balance_conf >= num_exec){
                reorder_posssible = 1;
                balance_conf = balance_conf - num_exec;
            }
        }else{
            if(balance_conf >= fee_settlement + commission_settlement_pre ){
                reorder_posssible = 1;
                balance_conf = balance_conf - (fee_settlement + commission_settlement_pre);
            }
        }
        
        if(reorder_posssible === 1){
            reorder.push({
                result : orderFailed.result,
                exchange : eachboards.exchange,
                price: eachboards.amount,
                size: num_exec,
                time : eachboards.time,
                pair : eachboards.product_code,
                commission_settlement_pre : commission_settlement_pre,
                commission_key_pre : commission_key_pre,
                orderfailkey : orderFailed.orderfailedkey
            });
            num = num - num_exec;
            if( num === 0 ){
                //break this loop
                return false;
            }
        }
        return true;
    });
    if(reorder.length > 0 && num === 0){
        callback(null,reorder);
    }else if(reorder.length > 0 && num !== 0){
        var message = orderFailed.exchange + "(" + orderFailed.result + ":" + orderFailed.orderfailedkey + ") Size:" + num + '\n' + '残高不足で上記のsize分実行できませんでした。reorderは実施しません。'
        var err = {err:'1',message: message};
        callback(err,null);
    }else{
        var err = {err:'1',message:'残高が足りません。reorderは実施しません。'};
        callback(err,null);
    }
    reorder.length = 0;
}


/* orderclear
** orderをclear
*/
candyThink.prototype.orderclear = function(){

    this.order.length = 0;

}

module.exports = candyThink;