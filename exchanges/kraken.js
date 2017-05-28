var _ = require('underscore');
var async = require('async');
var Kraken = require(__dirname + '/../Library/kraken.js');

var exchange = function(candyConfig, logger) {

    this.kraken = new Kraken(candyConfig.kraken.apiKey, candyConfig.kraken.secret, candyConfig.kraken.otp);
    this.currencyPair = {
        pair: 'XETHXXBT',
        currency: 'XXBT',
        asset: 'XETH'
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
        'assetDepositStatus',
        'currencyAddress',
        'assetAddress'
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

                this.logger.error(callerName + ': Kraken API returned Unknown asset pair error, exiting!');
                return process.exit();

            } else {

                this.logger.error(callerName + ': Kraken API returned the following error:');
                this.logger.error(parsedError.substring(0,99));

                if(retryAllowed) {

                    this.logger.error('Retrying in 31 seconds!');
                    return this.retry(caller, args);
                    
                }
            }

        }else{

            this.logger.debug(callerName + ': Kraken API Call Result (Substring)!');
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

                var assetValue = _.find(data.result, function(value, key) {
                    return key === asset;
                });
                var currencyValue = _.find(data.result, function(value, key) {
                    return key === currency;
                });
                if(!assetValue) {
                    assetValue = 0;
                }
                if(!currencyValue) {
                    currencyValue = 0;
                }
                this.getTransactionFee(retry, function(err, result) {
                    cb(null, {
                        kraken : 
                            {
                                currencyAvailable: currencyValue, 
                                assetAvailable: assetValue, 
                                fee: result.kraken.fee
                            }
                    }
                    );
                });

            } else {

                cb(err, null);

            }
        }.bind(this);
        this.kraken.api('Balance', {}, this.errorHandler(this.getBalance, args, retry, 'getBalance', handler, finished));
    }.bind(this);
    this.q.push({name: 'getBalance', func: wrapper});
};

exchange.prototype.getTransactionFee = function(retry, cb) {

    var args = arguments;

    var wrapper = function(finished) {
        var pair = this.currencyPair.pair;

        var handler = function(err, data) {

            if (!err) {
                var fee = parseFloat(_.find(data.result.fees, function (value, key) {
                    return key === pair;
                }).fee);
                cb(null, {
                    kraken: {
                        fee: fee
                    }
                });
            } else {
                cb(err, null);
            }
        };

        this.kraken.api('TradeVolume', {"pair": pair}, this.errorHandler(this.getTransactionFee, args, retry, 'getTransactionFee', handler, finished));
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
                    kraken : {
                        status : data.result
                    }
                });
            }else{
                cb(err, null);
            }    
        };

        this.kraken.api('WithdrawStatus', {"asset": currency}, this.errorHandler(this.currencyWithdrawalStatus, args, retry, 'currencyWithdrawalStatus', handler, finished));
    
    }.bind(this);
    this.q.push({name: 'currencyWithdrawalStatus', func: wrapper});

}

exchange.prototype.assetWithdrawalStatus = function(retry, cb){

    var args = arguments;

    var wrapper = function(finished) {

        var asset = this.currencyPair.asset;

        var handler = function(err, data) {
            if(!err){    
                cb(null, {
                    kraken : {
                        status : data.result
                    }
                });
            }else{
                cb(err, null);
            }    
        };

        this.kraken.api('WithdrawStatus', {"asset": asset}, this.errorHandler(this.assetWithdrawalStatus, args, retry, 'assetWithdrawalStatus', handler, finished));
    }.bind(this);
    this.q.push({name: 'assetWithdrawalStatus', func: wrapper});

}

exchange.prototype.currencyDepositStatus = function(retry, cb){

    var args = arguments;

    var wrapper = function(finished) {

        var currency = this.currencyPair.currency;

        var handler = function(err, data) {
            if(!err){    
                cb(null, {
                    kraken : {
                        status : data.result
                    }
                });
            }else{
                cb(err, null);
            }    
        };

        this.kraken.api('DepositStatus', {"asset": currency}, this.errorHandler(this.currencyDepositStatus, args, retry, 'currencyDepositStatus', handler, finished));
    }.bind(this);
    this.q.push({name: 'depositStatus', func: wrapper});

}

exchange.prototype.assetDepositStatus = function(retry, cb){

    var args = arguments;

    var wrapper = function(finished) {

        var asset = this.currencyPair.asset;

        var handler = function(err, data) {
            if(!err){    
                cb(null, {
                    kraken : {
                        status : data.result
                    }
                });
            }else{
                cb(err, null);
            }    
        };

        this.kraken.api('DepositStatus', {"asset": asset}, this.errorHandler(this.assetDepositStatus, args, retry, 'assetDepositStatus', handler, finished));
    }.bind(this);
    this.q.push({name: 'depositStatus', func: wrapper});

}

exchange.prototype.currencyAddress = function(retry, cb){

    var args = arguments;

    var wrapper = function(finished) {

        var currency = this.currencyPair.currency;

        var handler = function(err, data) {
            if(!err){    
                cb(null, {
                    kraken : {
                        address : data.result
                    }
                });
            }else{
                cb(err, null);
            }    
        };

        this.kraken.api('DepositAddresses', {"asset": currency, "method" : "Bitcoin"}, this.errorHandler(this.currencyAddress, args, retry, 'currencyAddress', handler, finished));
    }.bind(this);
    this.q.push({name: 'currencyAddress', func: wrapper});

}

exchange.prototype.assetAddress = function(retry, cb){

    var args = arguments;

    var wrapper = function(finished) {

        var asset = this.currencyPair.asset;

        var handler = function(err, data) {
            if(!err){    
                cb(null, {
                    kraken : {
                        address : data.result
                    }
                });
            }else{
                cb(err, null);
            }    
        };

        this.kraken.api('DepositAddresses', {"asset": asset, "method" : "Ether (Hex)"}, this.errorHandler(this.currencyAddress, args, retry, 'currencyAddress', handler, finished));
    }.bind(this);
    this.q.push({name: 'currencyAddress', func: wrapper});

}

exchange.prototype.sendBTC = function(retry, access, balance, address, cb){

    var args = arguments;

    var wrapper = function(finished) {

        var currency = this.currencyPair.currency;

        var handler = function(err, data) {
            if(!err){    
                cb(null, {
                    kraken : {
                        refid : data.result
                    }
                });
            }else{
                cb(err, null);
            }    
        };

        this.kraken.api('Withdraw', {"asset": currency, key : address, amount : balance}, this.errorHandler(this.sendBTC, args, retry, 'sendBTC', handler, finished));
    }.bind(this);
    this.q.push({name: 'Withdraw', func: wrapper});

}

exchange.prototype.sendETH = function(retry, access, balance, address, cb){

    var args = arguments;

    var wrapper = function(finished) {

        var asset = this.currencyPair.asset;

        var handler = function(err, data) {
            if(!err){    
                cb(null, {
                    kraken : {
                        refid : data.result
                    }
                });
            }else{
                cb(err, null);
            }    
        };

        this.kraken.api('Withdraw', {"asset": asset, key : address, amount : balance}, this.errorHandler(this.sendETH, args, retry, 'sendETH', handler, finished));
    }.bind(this);
    this.q.push({name: 'Withdraw', func: wrapper});

}

module.exports = exchange;
