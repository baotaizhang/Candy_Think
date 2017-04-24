/*
 * Main entry point for our app
 * "start" method gets called when the project get started
 * I always have underscore.js everwhere
 */

var _ = require('underscore');

var loggingservice = require(__dirname + '/services/loggingservice.js');

var app = function(){
 
    _.bindAll(this, 'initializeLogger', 'appListener', 'launchTrader','launchBacktester', 'start');  
    
};

app.prototype.initializeLogger = function(appName) {

    this.logger = new loggingservice(appName);

};

app.prototype.appListener = function() {

    this.app.on('done', function() {
        this.logger.log('----------------------------------------------------');
        this.logger.log('App closed.');
        this.logger.log('----------------------------------------------------');
    }.bind(this));

    this.app.on('restart', function() {
        this.logger.log('----------------------------------------------------');
        this.logger.log('App rebooting.....');
        this.logger.log('----------------------------------------------------');
    }.bind(this));

};

app.prototype.launchTrader = function(){

    this.logger.log('----------------------------------------------------');
    this.logger.log('Production mode init.')
    this.logger.log('Launching trader module.');
    this.logger.log('----------------------------------------------------');
    this.app = require(__dirname + '/apps/trader.js');
    this.appListener();
    this.app.start();

}

app.prototype.launchBacktester = function() {

    this.logger.log('----------------------------------------------------');
    this.logger.log('Backtest mode init.')
    this.logger.log('Launching backtest module.');
    this.logger.log('----------------------------------------------------');
    this.appListener();
    this.app = require(__dirname + '/apps/backtester.js');
    this.app.start();

};

app.prototype.start = function(){

    var argument = process.argv[2];

    if(!argument){

        this.appName = 'trader';
        this.run = this.launchTrader;

    }else if(argument === '-b'){

        this.appName = 'backtester';
        this.run = this.launchBacktester;

   }else{

       this.appName = 'app';
       run = null;

    }

    this.initializeLogger(this.appName);

    // AnnounceStart
    this.logger.log('----------------------------------------------------');
    this.logger.debug('Starting CandyThink');
    this.logger.log('Working Dir = ' + process.cwd());
    this.logger.log('----------------------------------------------------');

    if(this.run) {

        this.run();

    } else {

        this.logger.log('----------------------------------------------------');
        this.logger.log('Invalid argument, supported options:');
        this.logger.log(': Launch Real trader');
        this.logger.log('-b: Launch Backtester');
        this.logger.log('----------------------------------------------------');

    }
}

var candyThink = new app();
candyThink.start();
