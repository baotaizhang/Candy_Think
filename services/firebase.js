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
        'systemConnection',
        'placeOrder',
        'lineNotification',
        'chartUpdate',
        'disconnect',
        'orderFailedConnection',
        'orderFailedCount'
   );

};

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(firebase, EventEmitter);
//---EventEmitter Setup

firebase.prototype.systemConnection = function(){

    this.FirebaseAccess.child(this.setting.systemPass).on("value", function(snapshot) {
        var data = snapshot.val();
        data.name = 'system';
        this.emit('systemStream', data);
    }.bind(this), function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

};

firebase.prototype.placeOrder = function(pass, orderType){

    this.FirebaseAccess.child(pass).push().set(orderType).then(function(){
        }, function(error) {
            console.log("Error: " + error);
        }
    );

}

firebase.prototype.lineNotification = function(message, finished, callback){

    console.log(message);

    this.FirebaseAccess.child(this.setting.lineNotificationPass).push().set({
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
    this.FirebaseAccess.child(this.setting.orderFailedPass).on("child_added", function(snapshot) {
        var data = snapshot.val();
        data.orderfailedkey = snapshot.key;
        this.emit('orderFailedStream', data);
    }.bind(this), function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
};

firebase.prototype.orderFailedCount = function(){
    this.FirebaseAccess.child(this.setting.orderFailedPass).on("value", function(snapshot) {
        this.emit('orderFailedCheck', snapshot.numChildren());
    }.bind(this), function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
};

module.exports = firebase;
