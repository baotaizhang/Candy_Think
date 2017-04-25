var _ = require('underscore');
var settingService = require(__dirname + '/settingService.js');

var setting = function(storage, logger){

    this.storage = storage;
    this.logger = logger;
    this.candySetting = {};
    _.bindAll(this, 'bindSetting', 'connection');

}

setting.prototype.bindSetting = function(settings){

    this.logger.log('Settings updated.');
    this.logger.log(settings);
    this.candySetting = settings;

}

setting.prototype.connection = function(){

    this.storage.settingConnection(this.bindSetting);

}

module.exports = setting;
