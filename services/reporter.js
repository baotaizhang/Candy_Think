var _ = require('underscore');
var async = require('async');

var reporter = function(firebase, logger){

    this.q = async.queue(function (task, callback) {
        this.logger.debug('Added ' + task.name + ' report call to the queue.');
        this.logger.debug('There are currently ' + this.q.running() + ' running jobs and ' + this.q.length() + ' jobs in queue.');
        task.func(function() { setTimeout(callback, 2000); });
    }.bind(this), 1);

    this.logger = logger;
    this.firebase = firebase;

    _.bindAll(this, 'lineNotification');

}

reporter.prototype.lineNotification = function(message){

    var wrapper = function(finished){
        this.firebase.lineNotification(message, finished);
    }.bind(this);

    this.q.push({name: 'lineNotification', func: wrapper});

}
