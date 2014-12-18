child-process-promise
=====================

Simple wrapper around the `child_process` module that makes use of promises

# Installation
```
npm install child-process-promise --save
```

# Usage

## exec
```javascript
var exec = require('child-process-promise').exec;

exec('echo hello')
    .then(function (result) {
        var stdout = result.stdout;
        var stderr = result.stderr;
        console.log('stdout: ', stdout);
        console.log('stderr: ', stderr);
    })
    .fail(function (err) {
        console.error('ERROR: ', err);
    })
    .progress(function (childProcess) {
        console.log('childProcess.pid: ', childProcess.pid);
    });
```

## spawn
```javascript
var spawn = require('child-process-promise').spawn;

spawn('echo', ['hello'])
    .progress(function (childProcess) {
        console.log('[spawn] childProcess.pid: ', childProcess.pid);
        childProcess.stdout.on('data', function (data) {
            console.log('[spawn] stdout: ', data.toString());
        });
        childProcess.stderr.on('data', function (data) {
            console.log('[spawn] stderr: ', data.toString());
        });
    })
    .then(function () {
        console.log('[spawn] done!');
    })
    .fail(function (err) {
        console.error('[spawn] ERROR: ', err);
    });
```
### Options

#### capture
Type: `Array`  
Default: `[]`

Pass an additional `capture` option to buffer the result of `stdout` and/or `stderr`

```javascript
var spawn = require('child-process-promise').spawn;

spawn('echo', ['hello'], { capture: [ 'stdout', 'stderr' ]})
    .then(function (result) {
        console.log('[spawn] stdout: ', result.stdout.toString());
    })
    .fail(function (err) {
        console.error('[spawn] stderr: ', err.stderr);
    });
```
