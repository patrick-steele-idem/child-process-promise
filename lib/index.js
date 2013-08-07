var child_process = require('child_process');

var q = require('q');
function exec(command, options) {

    var deferred = q.defer();
    var childProcess;

    var args = Array.prototype.slice.call(arguments, 0);
    args.push(function(err, stdout, stderr) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve({
                childProcess: childProcess,
                stdout: stdout,
                stderr: stderr
            });
        }
    });

    childProcess = child_process.exec.apply(child_process, args);
    setImmediate(function() {
        deferred.notify(childProcess);
    });

    return deferred.promise;
}

exports.exec = exec;