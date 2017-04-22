var _ = require('underscore');

var firebaseStorage = function(candyConfig){

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
        'remove',
        'connection'
    );

}

firebaseStorage.prototype.remove = function(argument){
    this.FirebaseAccess.removeData(argument);
}

firebaseStorage.prototype.connection = function(cb){
    this.FirebaseAccess.child('think/bitflyer/v1/getboard/ETH_BTC/board').on("child_added", function(snapshot) {
        console.log(snapshot.val());
        cb(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}

module.exports = firebaseStorage;
