var _ = require('underscore');
var async = require('async');
var moment = require('moment');
var poloniex = require(__dirname + '/../library/poloniex.js');

var exchange = function(candyConfig, logger, setting) {

    this.poloniex = new poloniex(candyConfig.poloniex.apiKey, candyConfig.poloniex.secret);
    this.currencyPair = {
        pair: setting.poloniex.pair,
        currency: setting.poloniex.currency,
        asset: setting.poloniex.asset
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
        'getBoard'
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

        if(err){
            this.logger.lineNotification(callerName + ': poloniex API がエラーです。リトライ : ' + retryAllowed + '\n' + err);               
            if(retryAllowed) {
                this.logger.error('Retrying in 31 seconds!');
                return this.retry(caller, args);
            }
        }else if(result.error) {
            this.logger.lineNotification(callerName + ': poloniex API がエラーです。リトライ : ' + retryAllowed + '\n' + result.error);               
            if(retryAllowed) {
                this.logger.error('Retrying in 31 seconds!');
                return this.retry(caller, args);
            }
        }else{
            this.logger.debug(callerName + ': poloniex API Call Result (Substring)!');
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

                _.forEach(data, function(value, key){
                
                    if(key == asset){
                        assetValue = value;
                    }else if(key == currency){
                        currencyValue = value;
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
                        poloniex : {
                            currencyAvailable: currencyValue, 
                            assetAvailable: assetValue, 
                            fee: result.poloniex.fee
                        }
                    });
                });

            } else {

                cb(err, null);

            }
        }.bind(this);
        this.poloniex.returnBalances(this.errorHandler(this.getBalance, args, retry, 'getBalance', handler, finished));
    }.bind(this);
    this.q.push({name: 'getBalance', func: wrapper});
};

exchange.prototype.getTransactionFee = function(retry, cb) {

    var args = arguments;

    var wrapper = function(finished) {
        var pair = this.currencyPair.pair;

        var handler = function(err, data) {

            if (!err) {
                var fee = parseFloat(data.takerFee) * 100;
                cb(null, {
                    poloniex : {
                        fee: fee
                    }
                });
            } else {
                cb(err, null);
            }
        };

        this.poloniex.returnFeeInfo(this.errorHandler(this.getTransactionFee, args, retry, 'getTransactionFee', handler, finished));
    }.bind(this);
    this.q.push({name: 'getTransactionFee', func: wrapper});

};

exchange.prototype.getBoard = function(retry, cb) {

    var args = arguments;

    var wrapper = function(finished) {

        var currency = this.currencyPair.currency;
        var asset = this.currencyPair.asset;

        var handler = function(err, data) {

            if (!err) {
                var board = {
                    exchange : 'poloniex',
                    time: moment().format("YYYY-MM-DD HH:mm:ss"),
                    asks: data.asks,
                    bids: data.bids
                };
                cb(null, board);
            } else {
                cb(err, null);
            }
        };

        this.poloniex.returnOrderBook(currency, asset, this.errorHandler(this.getBoard, args, retry, 'getboard', handler, finished));
    }.bind(this);
    this.q.push({name: 'getboard', func: wrapper});

};

module.exports = exchange;  
