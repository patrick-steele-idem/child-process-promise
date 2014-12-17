var child_process = require('child_process');
var q = require('q');

function exec(command, options) {
    var deferred = q.defer();
    var args = Array.prototype.slice.call(arguments, 0);
    var cp;

    args.push(function (err, stdout, stderr) {
        if (err) {
            err.message += command + ' (exited with error code ' + err.code + ')';
            err.stdout = stdout;
            err.stderr = stderr;
            deferred.reject(err);
        }
        else {
            deferred.resolve({
                childProcess: cp,
                stdout: stdout,
                stderr: stderr
            });
        }
    });

    cp = child_process.exec.apply(child_process, args);

    process.nextTick(function () {
        deferred.notify(cp);
    });

    return deferred.promise;
}

function spawn(command, args, options) {
    var deferred = q.defer();
    var cp;
    var result;

    cp = child_process.spawn(command, args, options);

    // Make sure the callee had a chance to add listeners.
    process.nextTick(function () {
        deferred.notify(cp);
    });

    cp.stdout.on('data', function (data) {
      result = data;
    });

    cp.on('error', deferred.reject);

    cp.on('close', function (code) {
        if (code !== 0) {
            var commandStr = command + (args.length ? (' ' + args.join(' ')) : '');
            deferred.reject({
                code: code,
                message: '"' + commandStr + '" failed with code ' + code
            });
        }
        else {
            deferred.resolve(result);
        }
    });

    return deferred.promise;
}

exports.exec = exec;
exports.spawn = spawn;
