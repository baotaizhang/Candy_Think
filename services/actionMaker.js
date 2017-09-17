var _ = require('underscore');
var actionIndex = 0;
var pairIndex = 0;

var actionMaker = function(setting){

    this.setting = setting;
    _.bindAll(this, 'orderFailed', 'trading');

};

actionMaker.prototype.orderFailed = function(){

    return {
        action : 'orderFailed',
        getBalanceRetry : true,
        getBoardRetry : true
    };

}

actionMaker.prototype.trading = function(tradeStatus){

    this.setting.bitflyer = this.setting[this.setting.pair[pairIndex]].bitflyer;
    this.setting.poloniex = this.setting[this.setting.pair[pairIndex]].poloniex;
    this.setting.kraken = this.setting[this.setting.pair[pairIndex]].kraken;

    var action = {
        action : this.setting.action[actionIndex],
        getBalanceRetry : true,
        getBoardRetry : true
    }

    actionIndex += 1;

    if(actionIndex == this.setting.action.length() - 1){
        actionIndex = 0:
        pairIndex += 1;
        if(pairIndex == this.setting.pair.length() - 1){
            pairIndex = 0;
        }
    }

    return action;

}

module.exports = actionMaker;
