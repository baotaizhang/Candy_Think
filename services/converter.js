var _ = require('underscore');
var tools = require(__dirname + '/../util/tools.js');

var converter = function(setting){

    this.setting = setting;
    _.bindAll(this, 'formatFiat', 'convert');

};

converter.prototype.formatFiat = function(exchange, amount, ask_bid, asset, fiatRate){

    setting = this.setting[exchange];
    if(setting.format){
        var target = _.find(fiatRate.quotes, function(fiat){
            return fiat.currencyPairCode == setting.format;
        });
        amount = tools.round(amount / target[ask_bid], 8);
    }

    return amount;

}

converter.prototype.convert = function(groupedBoards, balances, fiatRate){

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
            //amount : this.formatFiat(key, balance[key].currencyAvailable, "ask", this.setting[key].currency, fiatRate)
            amount : 1000000

        });

        candyThinkWay.balance.push({
        
            exchange_type : exchange_type_count,
            exchange : key,
            currency_code : this.setting.asset,
            //amount : this.formatFiat(key, balance[key].assetAvailable, "ask", this.setting[key].asset, fiatRate)
            amount : 1000000
        
        });

        candyThinkWay.fee.push({

            exchange_type:exchange_type_count,
            exchange: key,
            fee: balance[key].fee

        });

        exchange_type_count++;
    
    }.bind(this));

    var candyThinkBoards = [];
    var no = 0;

    groupedBoards.forEach(function(board){
        _.each(_.pick(board, 'asks', 'bids'),function(orders, ask_bid){
            if(orders){
                orders.forEach(function(order){          
                
                    if(board.exchange === 'bitflyer'){
                        candyThinkWay.boards.push({
                            no : no++,
                            exchange_type : 1,
                            exchange : board.exchange,
                            ask_bid : ask_bid.substr(0,3),
                            num : order.size,
                            amount : this.formatFiat(board.exchange, order.price, ask_bid.substr(0,3), this.setting[board.exchange].asset, fiatRate),
                            actualAmount : order.price,
                            product_code : this.setting.pair,
                            specific_product_code : this.setting[board.exchange].product_code,
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
                            product_code : this.setting.pair,
                            specific_product_code : this.setting[board.exchange].pair,
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
                            product_code : this.setting.pair,
                            specific_product_code : this.setting[board.exchange].pair,
                            time : board.time
                        })

                    }
                }.bind(this));
            }
        }.bind(this));
    }.bind(this));
    return candyThinkWay;

}

module.exports = converter;
