var assert = require('assert');
var cp = require('../');

cp.exec('echo hello')
    .then(function (result) {
        var stdout = result.stdout;
        var stderr = result.stderr;

        assert.equal(stdout.toString(), 'hello\n');
        assert.equal(stderr.toString(), '');
    })
    .fail(function (err) {
        console.error("ERROR: ", (err.stack || err));
    })
    .progress(function (childProcess) {
        console.log('[exec] childProcess.pid: ', childProcess.pid);
    });

cp.execFile('echo', ['hello'])
    .then(function (result) {
        var stdout = result.stdout;
        var stderr = result.stderr;

        assert.equal(stdout.toString(), 'hello\n');
        assert.equal(stderr.toString(), '');
    })
    .fail(function (err) {
        console.error("ERROR: ", (err.stack || err));
    })
    .progress(function (childProcess) {
        console.log('[execFile] childProcess.pid: ', childProcess.pid);
    });

var spawnOut = '';
var spawnErr = '';

cp.spawn('echo', ['hello'])
    .progress(function (childProcess) {
        console.log('[spawn] childProcess.pid: ', childProcess.pid);
        childProcess.stdout.on('data', function (data) {
            spawnOut += data;
        });
        childProcess.stderr.on('data', function (data) {
            spawnErr += data;
        });
    })
    .then(function () {
        assert.equal(spawnOut.toString(), 'hello\n');
        assert.equal(spawnErr.toString(), '');
    })
    .fail(function (err) {
        console.error("ERROR: ", (err.stack || err));
    });

cp.spawn('echo', ['hello'], { capture: ['stdout'] })
    .progress(function (childProcess) {
        console.log('[spawn] childProcess.pid: ', childProcess.pid);
    })
    .then(function (result) {
        assert.equal(result.stdout.toString(), 'hello\n');
    })
    .fail(function (err) {
        console.error("ERROR: ", (err.stack || err));
    });

cp.spawn('ls', ['./fail'], { capture: ['stdout', 'stderr'] })
    .progress(function (childProcess) {
        console.log('[spawn] childProcess.pid: ', childProcess.pid);
    })
    .then(function (result) {
        assert.equal(result.stdout.toString(), '');
    })
    .fail(function (err) {
        console.error("ERROR: ", (err.stack || err));
        assert.equal(err.stderr.toString(), 'ls: ./fail: No such file or directory\n');
    });
