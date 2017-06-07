var _ = require('underscore');
var async = require('async');
var moment = require("moment");

var firebase = function(candyConfig,setting){

    this.setting = setting;
    this.admin = require("firebase-admin");
    var serviceAccount = require(__dirname + "/../candyConfig/candy-crypto-chart-firebase-adminsdk-szicg-bee5dc8975.json");

    //to check if Firebase has already been initialized.
    if (this.admin.apps.length === 0) {
        this.admin.initializeApp({
            credential: this.admin.credential.cert(serviceAccount),
            databaseURL: candyConfig.databaseURL
        });
    }

    // As an admin, the app has access to read and write all data, regardless of Security Rules
    this.FirebaseAccess = this.admin.database().ref();

    _.bindAll(this,
        'boardConnection',
        'systemConnection',
        'placeOrder',
        'chartUpdate',
        'lineNotification',
        'disconnect',
        'boardDetach'
    );

};

firebase.prototype.systemConnection = function(cb){

    this.FirebaseAccess.child('common/system').on("value", function(snapshot) {
        var data = snapshot.val();
        data.name = 'system';
        cb(data);
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}

firebase.prototype.boardConnection = function(cb){

    _.each(this.setting.exchanges, function(pass, exchange){

        this.FirebaseAccess.child(pass).orderByChild("time").limitToLast(1).on("child_added", function(snapshot) {
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

    this.FirebaseAccess.child("test/" + pass).push().set(orderType).then(function(){
        }, function(error) {
            console.log("Error: " + error);
        }
    );
}

firebase.prototype.lineNotification = function(message, finished, callback){

    console.log(message);

    this.FirebaseAccess.child('test/common/system/line').push().set({
        "system" : "candy_think",
        "message" : message,
        "time" : moment().format("YYYY-MM-DD HH:mm:ss")
    }).then(function(){
        if (typeof(callback) === 'function') { 
            callback(finished);
        }else{
            finished();
        }
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

firebase.prototype.disconnect = function(){
    this.admin.app().delete();
}

firebase.prototype.orderFailedConnection = function(){
    this.FirebaseAccess.child(this.setting.orderFailedPass).on("value", function(snapshot) {
        cb(snapshot.numChildren());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}

firebase.boardDetach = function(){
    _.each(this.setting.exchanges, function(pass, key){
        this.FirebaseAccess.child(pass).off();
    });
}



module.exports = firebase;
