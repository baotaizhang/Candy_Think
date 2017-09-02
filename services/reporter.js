var _ = require('underscore');
var moment = require('moment');
var tools = require(__dirname + '/../util/tools.js');

var reporter = function(firebase, setting, logger, inMemory){

    this.firebase = firebase;
    this.setting = setting;
    this.logger = logger;
    this.inMemory = inMemory;

    _.bindAll(this, 'reportBalance', 'reportRevenue');

}

reporter.prototype.reportBalance = function(balances){

    balances.forEach(function(balance){		
        var key = Object.keys(balance)[0];		
        this.logger.lineNotification(key + "残高\nBTC : " + tools.round(balance[key].currencyAvailable, 8) + 
        "\nETH : " + tools.round(balance[key].assetAvailable, 8));
    }.bind(this));

}

reporter.prototype.reportRevenue = function(balances){

    var total = {
        currency : 0,
        asset : 0,
        time : moment().format("YYYY-MM-DD HH:mm:ss")
    };

    balances.forEach(function(balance){		
        var key = Object.keys(balance)[0];		
        total.currency += tools.round(balance[key].currencyAvailable, 8);
        total.asset += tools.round(balance[key].assetAvailable, 8);
    });

    if(this.inMemory.previousBalance.currency){

        var currencyRevenue = tools.round(total.currency - this.inMemory.previousBalance.currency, 8);
        var assetRevenue = tools.round(total.asset - this.inMemory.previousBalance.asset, 8);

        if(currencyRevenue != 0){

            this.logger.lineNotification('Latest Profit\n' 
                + this.setting.currency + ': ' + currencyRevenue + "\n"
                + this.setting.asset + ': ' + assetRevenue
            );

            this.firebase.chartUpdate(this.setting.profitPass + this.setting.currency + '/' , 
            currencyRevenue ,moment().format("YYYY-MM-DD HH:mm:ss"));

            this.firebase.chartUpdate(this.setting.profitPass + this.setting.asset + '/' , 
            assetRevenue ,moment().format("YYYY-MM-DD HH:mm:ss"));

            balances.forEach(function(balance){		
                var key = Object.keys(balance)[0];		
                this.firebase.chartUpdate(this.setting.balancePass + key + '/' + this.setting.currency, 
                balance[key].currencyAvailable ,moment().format("YYYY-MM-DD HH:mm:ss"));		
                this.firebase.chartUpdate(this.setting.balancePass + key + '/' + this.setting.asset, 
                balance[key].assetAvailable ,moment().format("YYYY-MM-DD HH:mm:ss"));
            }.bind(this));
        }

    }
    this.inMemory.previousBalance = total;

}

module.exports = reporter;
