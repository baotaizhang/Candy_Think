var _ = require('underscore');
var loggingservice = require(_dirname + 'loggingservice.js');

var logger = new loggingservice('setting', config.debug);

var setting = function(storage){

    this.storage = storage;
    this.candySetting = {};

}

setting.prototype.bind(settings){

    this.logger.log('Settings updated.');
    this.logger.log(settings);
    this.candySetting = settings;

}

setting.prototype.connection = function(){

    storage.prototype.settingsConnection(this.bind);

}

module.exports = settings;
