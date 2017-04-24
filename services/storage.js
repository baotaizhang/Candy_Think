var _ = require('underscore');
var moment = require('moment');

var storage = function(candyConfig){

    var admin = require("firebase-admin");
    var serviceAccount = require(__dirname + "/../config/candy-crypto-chart-firebase-adminsdk-szicg-bee5dc8975.json");

    //to check if Firebase has already been initialized.
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: candyConfig.databaseURL
        });
    }

    // As an admin, the app has access to read and write all data, regardless of Security Rules
    this.FirebaseAccess = admin.database().ref();

    _.bindAll(this,
        'connection',
        'getUnprocessedBoard',
        'pushBoard',
        'clear'
    );

    this.unprocessedBoard = [];

};

storage.prototype.getUnprocessedBoard = function(callback){

    callback('', this.unprocessedBoard);

};

storage.prototype.clear = function(){

    this.unprocessedBoard.length = 0;

};

storage.prototype.pushBoard = function(board, callback){

    this.unprocessedBoard.push(board);
    callback('');

}

storage.prototype.connection = function(cb){

    this.FirebaseAccess.child('think/bitflyer/v1/getboard/ETH_BTC/board').on("child_added", function(snapshot) {
        var data = snapshot.val();
        data.name = 'bitflyer';
        cb(data);
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

    this.FirebaseAccess.child('crypto/kraken/0/public/Depth/XETHXXBT').on("child_added", function(snapshot) {
        var data = snapshot.val();
        data.name = 'kraken';
        cb(data);
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

};

module.exports = storage;