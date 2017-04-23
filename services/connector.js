var _ = require('underscore');

var firebaseConnector = function(storage){

    // As an admin, the app has access to read and write all data, regardless of Security Rules
    this.storage = storage;

    _.bindAll(this,
        'communicate',
        'start',
        'stop',
        'order'
    );
}

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(firebaseConnector, EventEmitter);
//---EventEmitter Setup

firebaseConnector.prototype.communicate = function(data){
     
    this.emit('receiveBoard', data);

}

firebaseConnector.prototype.start = function(){

    this.storage.connection(this.communicate);

}

firebaseConnector.prototype.stop = function(){
}

firebaseConnector.prototype.order = function(){
}

module.exports = firebaseConnector;
