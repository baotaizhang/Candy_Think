var forever = require('forever-monitor');

var child = new (forever.Monitor)('candy.js', {
    args: [process.argv[2]]
});

child.on('exit:code', function(code) {
    console.error('Forever detected script exited with code ' + code);
    child.stop();
});

child.start();
