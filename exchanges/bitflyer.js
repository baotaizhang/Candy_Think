var _ = require('underscore');
var async = require('async');
var bitflyer = require(__dirname + '/../Library/bitflyer.js');

var exchange = function(candyConfig, logger, setting) {

    this.bitflyer = new bitflyer(candyConfig.bitflyer.apiKey, candyConfig.bitflyer.secret);
    this.currencyPair = {
        product_code: setting.bitflyer.product_code,
        currency: setting.bitflyer.currency,
        asset: setting.bitflyer.asset
    };
    this.q = async.queue(function (task, callback) {
        this.logger.debug('Added ' + task.name + ' API call to the queue.');
        this.logger.debug('There are currently ' + this.q.running() + ' running jobs and ' + this.q.length() + ' jobs in queue.');
        task.func(function() { setTimeout(callback, 3100); });
    }.bind(this), 1);

    this.logger = logger;

    _.bindAll(this, 
        'retry', 
        'errorHandler', 
        'getBalance', 
        'getTransactionFee',
        'currencyWithdrawalStatus', 
        'assetWithdrawalStatus',
        'currencyDepositStatus',
        'assetDepositStatus'
    );
};

// using variadic functions to bind
exchange.prototype.retry = function(method, args) {

    var self = this;

    _.each(args, function(arg, i) {
        if(_.isFunction(arg)){
            args[i] = _.bind(arg, self);
        }
    });

    setTimeout(function() {
        method.apply(self, args);
    }, 1000*31);
};

exchange.prototype.errorHandler = function(caller, receivedArgs, retryAllowed, callerName, handler, finished){

    return function(err, result){
        var args = _.toArray(receivedArgs);
        var parsedError = null;

        finished();

        if(err) {

            if(JSON.stringify(err) === '{}' && err.message) {
                parsedError = err.message;
            } else {
                parsedError = JSON.stringify(err);
            }

            if(parsedError === '["EQuery:Unknown asset pair"]') {

                this.logger.error(callerName + ': bitflyer API returned Unknown asset pair error, exiting!');
                return process.exit();

            } else {

                this.logger.lineNotification(callerName + ': bitflyer API がエラーです。リトライを継続します¥n' + parsedError.substring(0,99));

                if(retryAllowed) {

                    this.logger.error('Retrying in 31 seconds!');
                    return this.retry(caller, args);
                    
                }
            }

        }else{

            this.logger.debug(callerName + ': bitflyer API Call Result (Substring)!');
            this.logger.debug(JSON.stringify(result).substring(0,99));

        }

        handler(parsedError, result);

    }.bind(this);

};

exchange.prototype.getBalance = function(retry, cb){

    var args = arguments;

    var wrapper = function(finished){

        var asset = this.currencyPair.asset;
        var currency = this.currencyPair.currency;

        var handler = function(err, data){

            if(!err){

                var assetValue;
                var currencyValue;

                data.forEach(function(value){
                
                    if(value.currency_code == asset){
                        assetValue = value.available;
                    }else if(value.currency_code == currency){
                        currencyValue = value.available;
                    }
                
                });

                if(!assetValue) {
                    assetValue = 0;
                }
                if(!currencyValue) {
                    currencyValue = 0;
                }
                this.getTransactionFee(retry, function(err, result) {
                    cb(null, {
                        bitflyer : {
                            currencyAvailable: currencyValue, 
                            assetAvailable: assetValue, 
                            fee: result.bitflyer.fee
                        }
                    });
                });

            } else {

                cb(err, null);

            }
        }.bind(this);
        this.bitflyer.api('getbalance', null, null, this.errorHandler(this.getBalance, args, retry, 'getBalance', handler, finished));
    }.bind(this);
    this.q.push({name: 'getBalance', func: wrapper});
};

exchange.prototype.getTransactionFee = function(retry, cb) {

    var args = arguments;

    var wrapper = function(finished) {
        var pair = this.currencyPair.product_code;

        var handler = function(err, data) {

            if (!err) {
                var fee = parseFloat(data.commission_rate);
                cb(null, {
                    bitflyer : {
                        fee: fee
                    }
                });
            } else {
                cb(err, null);
            }
        };

        this.bitflyer.api('gettradingcommission', {"product_code": pair}, null, this.errorHandler(this.getTransactionFee, args, retry, 'getTransactionFee', handler, finished));
    }.bind(this);
    this.q.push({name: 'getTransactionFee', func: wrapper});

};

exchange.prototype.currencyWithdrawalStatus = function(retry, cb){

    var args = arguments;

    var wrapper = function(finished) {
        
        var currency = this.currencyPair.currency;

        var handler = function(err, data) {
            if(!err){    
                cb(null, {
                    bitflyer : {
                        status : _.filter(data, function(status){ return status.currency_code == currency})
                    }
                });
            }else{
                cb(err, null);
            }    
        };

        this.bitflyer.api('getcoinouts', null, null, this.errorHandler(this.currencyWithdrawalStatus, args, retry, 'currencyWithdrawalStatus', handler, finished));
    
    }.bind(this);
    this.q.push({name: 'currencygetcoinouts', func: wrapper});

}

exchange.prototype.assetWithdrawalStatus = function(retry, cb){

    var args = arguments;

    var wrapper = function(finished) {
        
        var asset = this.currencyPair.asset;

        var handler = function(err, data) {
            if(!err){    
                cb(null, {
                    bitflyer : {
                        status : _.filter(data, function(status){ return status.currency_code == asset})
                    }
                });
            }else{
                cb(err, null);
            }    
        };

        this.bitflyer.api('getcoinouts', null, null, this.errorHandler(this.assetWithdrawalStatus, args, retry, 'assetWithdrawalStatus', handler, finished));
    
    }.bind(this);
    this.q.push({name: 'currencygetcoinouts', func: wrapper});

}

exchange.prototype.currencyDepositStatus = function(retry, cb){

    var args = arguments;

    var wrapper = function(finished) {
        
        var currency = this.currencyPair.currency;

        var handler = function(err, data) {
            if(!err){    
                cb(null, {
                    bitflyer : {
                        status : _.filter(data, function(status){ return status.currency_code == currency})
                    }
                });
            }else{
                cb(err, null);
            }    
        };

        this.bitflyer.api('getcoinins', null, null, this.errorHandler(this.currencyDepositStatus, args, retry, 'currencyDepositStatus', handler, finished));
    
    }.bind(this);
    this.q.push({name: 'currencygetcoinins', func: wrapper});

}

exchange.prototype.assetDepositStatus = function(retry, cb){

    var args = arguments;

    var wrapper = function(finished) {
        
        var asset = this.currencyPair.asset;

        var handler = function(err, data) {
            if(!err){    
                cb(null, {
                    bitflyer : {
                        status : _.filter(data, function(status){ return status.currency_code == asset})
                    }
                });
            }else{
                cb(err, null);
            }    
        };

        this.bitflyer.api('getcoinins', null, null, this.errorHandler(this.assetDepositStatus, args, retry, 'assetDepositStatus', handler, finished));
    
    }.bind(this);
    this.q.push({name: 'currencygetcoinins', func: wrapper});

}

module.exports = exchange;        
