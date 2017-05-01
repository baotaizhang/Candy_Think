var config = {};

config.init = function () {
    var filename = __dirname+"/candyConfig/candyConfig.json";
    var text = require("fs").readFileSync(filename);
    if(!text) {
        throw new Error("Couldn't read config file "+filename);
    }
    var obj = JSON.parse(text);
    console.log("Successfully read and parsed config file \n"+JSON.stringify(obj, null, " ")+"\n");
    return obj;
}

module.exports = config;
