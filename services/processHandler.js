var _ = require('underscore');

var processHandler = function(logger, processor, firebase){

    this.logger = logger;
    this.processor = processor;
    this.firebase = firebase;
    _.bindAll(this, 'emergencyStop');

}

processHandler.prototype.emergencyStop = function(){

    this.logger.lineNotification("�ً}��~�����݂܂�");
    var emergencyStop = setInterval(function(){

        if(this.processor.q.running() + this.processor.q.length() + this.logger.q.running() + this.logger.q.length() == 0){
            this.logger.lineNotification("�S�Ẵv���Z�X�̏I�����m�F���܂����B\n�V�X�e�����I�����܂�", function(){
                firebase.disconnect();
                clearInterval(emergencyStop);
            });
        }else{
            logger.lineNotification("�ғ����̃X���b�h�̊�����҂��Ă��܂��E�E�E");
        }
    },5000);

}

processHandler.prototype.start = function(){

    process.on('uncaughtException', function (err) {
        console.log(err);
        this.logger.lineNotification("�\�����Ȃ��G���[���������܂���\n" + err);
        this.emergencyStop();
    });

    process.on('exit', function (code) {
        console.log('exit code : ' + code);
    });

};

module.exports = processHandler;
