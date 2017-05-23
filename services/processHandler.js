var _ = require('underscore');

var processHandler = function(logger, processor, firebase){

    this.logger = logger;
    this.processor = processor;
    this.firebase = firebase;
    _.bindAll(this, 'emergencyStop');

}

processHandler.prototype.emergencyStop = function(){

    this.logger.lineNotification("緊急停止を試みます");
    var emergencyStop = setInterval(function(){

        if(this.processor.q.running() + this.processor.q.length() + this.logger.q.running() + this.logger.q.length() == 0){
            this.logger.lineNotification("全てのプロセスの終了を確認しました。\nシステムを終了します", function(){
                firebase.disconnect();
                clearInterval(emergencyStop);
            });
        }else{
            logger.lineNotification("稼働中のスレッドの完了を待っています・・・");
        }
    },5000);

}

processHandler.prototype.start = function(){

    process.on('uncaughtException', function (err) {
        console.log(err);
        this.logger.lineNotification("予期しないエラーが発生しました\n" + err);
        this.emergencyStop();
    });

    process.on('exit', function (code) {
        console.log('exit code : ' + code);
    });

};

module.exports = processHandler;
