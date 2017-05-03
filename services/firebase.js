var _ = require('underscore');
var async = require('async');

var firebase = function(candyConfig){

    var admin = require("firebase-admin");
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
        'settingConnection'
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

        this.FirebaseAccess.child(pass).orderByChild("time").on("child_added", function(snapshot) {
            var data = snapshot.val();
            data.exchange = exchange;
            data.key = snapshot.key;
            cb(data);

        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

    }.bind(this));
}

module.exports = firebase;
