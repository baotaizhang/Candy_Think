var candyDB = {};

candyDB.candyDBAccess = function(candyConfig){

    var admin = require("firebase-admin");
    var serviceAccount = require(__dirname + "/config/candy-crypto-chart-firebase-adminsdk-szicg-bee5dc8975.json");

    //to check if Firebase has already been initialized.
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: candyConfig.databaseURL
        });
    }

    console.log('firebase : ' + admin.app().name);

    // As an admin, the app has access to read and write all data, regardless of Security Rules
    var DB = admin.database();
    return DB;

}

module.exports = candyDB;
