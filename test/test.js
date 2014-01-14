var assert = require('assert');
var exec = require('../').exec;
var spawn = require('../').spawn;

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
        console.error("ERROR: ", (err.stack || err));
    })
    .progress(function(childProcess) {
        console.log('[exec] childProcess.pid: ', childProcess.pid);
    });

var spawnOut = '';
var spawnErr = '';

spawn('echo', ['hello'])
    .progress(function(childProcess) {
        console.log('[spawn] childProcess.pid: ', childProcess.pid);
        childProcess.stdout.on('data', function(data) {
            spawnOut += data;
            
        });
        childProcess.stderr.on('data', function(data) {
            spawnErr += data;
            
        });
    })
    .then(function(result) {
        //console.log('stdout: ', stdout);
        //console.log('stderr: ', stderr);
        assert.equal(spawnOut.toString(), 'hello\n');
        assert.equal(spawnErr.toString(), '');
    })
    .fail(function(err) {
        console.error("ERROR: ", (err.stack || err));
    });