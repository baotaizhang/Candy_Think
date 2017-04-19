var candyDB = require(__dirname + '/candyDB.js');
var config = require(__dirname + '/config.js');
var thinkPlugin = require(__dirname + '/thinkPlugin.js');
var candyConfig = config.init();

// firebase initialization
var DB = candyDB.candyDBAccess(candyConfig);
var DBRoot = DB.ref(); 
var candyThinkRoot;

if (process.argv[2] == '-t'){

    // You can change env just changing root ref.
    candyThinkRoot = DBRoot.child('test/think');

}else if (process.argv[2] == '-p'){

    candyThinkRoot = DBRoot.child('think');

}else{

    console.log('Argument ' + process.argv[2] + ' is incorrect.');
    process.exit();

};

var candyRef = {
    root: candyThinkRoot
};

// start function
var candy_think = function candy_think(data){
    // update config each time.
    candyConfig = config.init();
    // use plugins with asynchronous way
    thinkPlugin.forEach(function(plugin){
        plugin.func.call(function(){}, data, candyConfig);
    });
}

// wait transaction
candyRef.root.on("child_added", function(snapshot) {
    candy_think(snapshot.val());
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});
