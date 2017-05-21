var _ = require('underscore');
var async = require('async');
var moment = require("moment");

var firebase = function(candyConfig){

    var admin = require("firebase-admin");
    this.admin = admin;
    var serviceAccount = require(__dirname + "/../candyConfig/candy-crypto-chart-firebase-adminsdk-szicg-bee5dc8975.json");

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
        'boardConnection',
        'settingConnection',
        'placeOrder',
        'chartUpdate',
        'lineNotification'
    );

};

firebase.prototype.settingConnection = function(cb){

    this.FirebaseAccess.child('think/settings').on("value", function(snapshot) {
        var data = snapshot.val();
        data.name = 'settings';
        cb(data);
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}

firebase.prototype.boardConnection = function(cb){

    var exchanges = {
        bitflyer : 'crypto/bitflyer/v1/getboard/ETH_BTC/board',
        kraken : 'crypto/kraken/0/public/Depth/XETHXXBT'
    };

    _.each(exchanges, function(pass, exchange){

        this.FirebaseAccess.child(pass).orderByChild("time").limitToLast(3).on("child_added", function(snapshot) {
            var data = snapshot.val();
            data.exchange = exchange;
            data.key = snapshot.key;
            cb(data);

        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

    }.bind(this));

}

firebase.prototype.placeOrder = function(pass, orderType){

    this.FirebaseAccess.child(pass + '/test').push().set(orderType).then(function(){
        }, function(error) {
            console.log("Error: " + error);
        }
    );
}

firebase.prototype.lineNotification = function(message, time,finished){

    this.FirebaseAccess.child('common/system/line/test').push().set({
        "system" : "candy_think",
        "message" : message,
        "time" : moment().format("YYYY-MM-DD HH:mm:ss")
    }).then(function(){
        finished();
    }, function(error) {
        console.log("Error: " + error);
        finished();
    });

}


firebase.prototype.chartUpdate = function(pass, item, time){

    this.FirebaseAccess.child(pass).push().set({
        
        time : time,
        item : item
            
    }).then(function(){
    }, function(error) {
        console.log("Error: " + error);
    });
}

module.exports = firebase;
