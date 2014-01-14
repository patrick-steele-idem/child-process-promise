var child_process = require('child_process');

var q = require('q');
function exec(command, options) {

    var deferred = q.defer();
    var childProcess;

    var args = Array.prototype.slice.call(arguments, 0);
    args.push(function(err, stdout, stderr) {
        if (err) {
            err.message += command + ' (exited with error code ' + err.code + ')';
            err.stdout = stdout;
            err.stderr = stderr;
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
    process.nextTick(function() {
        deferred.notify(childProcess);
    });

    return deferred.promise;
}

function spawn(command, args, options) {
    var deferred = q.defer();

    var p = child_process.spawn(command, args, options);
    process.nextTick(function() { // Make sure the callee had a chance to add listeners
        deferred.notify(p);
    });

    p.on('close', function (code) {
        if (code !== 0) {
            var commandStr = command + (args.length ? (' ' + args.join(' ')) : '');
            deferred.reject('"' + commandStr + '" failed with code ' + code);
        }
        else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}
exports.exec = exec;
exports.spawn = spawn;