var svr = require('simple-http-server');
console.log("Starting server, quit with `Ctrl-C`")
svr.run({port:8080,directory:'www'});

