child-process-promise
=====================

Simple wrapper around the "child_process" module that makes use of promises

# Installation
```
npm install child-process-promise --save
```

# Usage
```javascript
var exec = require('child-process-promise').exec;

exec('echo hello')
    .then(function(result) {
        var stdout = result.stdout;
        var stderr = result.stderr;
        console.log('stdout: ', stdout);
        console.log('stderr: ', stderr);
    })
    .fail(function(err) {
        console.error("ERROR: ", err);
    })
    .progress(function(childProcess) {
        console.log('childProcess.pid: ', childProcess.pid);
    });
```