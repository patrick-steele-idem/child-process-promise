var assert = require('assert');
var exec = require('../').exec;

exec('echo hello')
    .then(function(result) {
        var stdout = result.stdout;
        var stderr = result.stderr;

        //console.log('stdout: ', stdout);
        //console.log('stderr: ', stderr);
        assert.equal(stdout.toString(), 'hello\n');
        assert.equal(stderr.toString(), '');
    })
    .fail(function(err) {
        console.error("ERROR: ", err);
    })
    .progress(function(childProcess) {
        console.log('childProcess.pid: ', childProcess.pid);
    });