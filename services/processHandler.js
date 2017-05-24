var _ = require('underscore');

var processHandler = function(logger, processor, firebase){

    this.logger = logger;
    this.processor = processor;
    this.firebase = firebase;
    _.bindAll(this, 'emergencyStop', 'start');

}

processHandler.prototype.emergencyStop = function(){

    this.logger.lineNotification("緊急停止を試みます");
    var emergencyStop = setInterval(function(){

        console.log(this.processor.q.running()  + ',' + this.processor.q.length()+ ','  + this.logger.q.running()+ ','  + this.logger.q.length());
        if(this.processor.q.running() + this.processor.q.length() + this.logger.q.running() + this.logger.q.length() == 0){
            this.processor.q.pause();
            this.logger.lineNotification("正常に取引モジュールを停止しました。プロセスを完了します", function(){
                process.exit(1);    
            });
        }else{
            this.logger.lineNotification("稼働中のスレッドの完了を待っています・・・");
        }
    }.bind(this),5000);

}

processHandler.prototype.start = function(){

    process.on('uncaughtException', function (err) {
        console.log(err);
        this.logger.lineNotification("リカバリ不可のエラーが発生しました。システムを強制終了します\n" + err, function(finished){
        
            process.exit(1);
        
        });
    }.bind(this));

    process.on('exit', function (code) {
        console.log('exit code : ' + code);
    });

};

module.exports = processHandler;

