/*
 * Main entry point for our app
 * "start" method gets called when the project get started
 * I always have underscore.js everwhere
 */

var _ = require('underscore');

var app = function(){
 
    _.bindAll(this, 'launchTrader','launchBacktester', 'start');  
    
};

app.prototype.launchTrader = function(){

    console.log('----------------------------------------------------');
    console.log('Production mode init.')
    console.log('Launching trader module.');
    console.log('----------------------------------------------------');
    this.app = require(__dirname + '/apps/trader.js');
    this.app.start();

}

app.prototype.launchBacktester = function() {

    console.log('----------------------------------------------------');
    console.log('Backtest mode init.')
    console.log('Launching backtest module.');
    console.log('----------------------------------------------------');
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

    // AnnounceStart
    console.log('----------------------------------------------------');
    console.log('Starting CandyThink');
    console.log('Working Dir = ' + process.cwd());
    console.log('----------------------------------------------------');

    if(this.run) {

        this.run();

    } else {

        console.log('Invalid argument, supported options:');
        console.log(': Launch Real trader');
        console.log('-b: Launch Backtester');

    }
}

var candyThink = new app();
candyThink.start();

