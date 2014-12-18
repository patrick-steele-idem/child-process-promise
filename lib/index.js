'use strict';
var childProcess = require('child_process');
var q = require('q');

/**
 * Promise wrapper for exec, execFile
 *
 * @param {String} method
 * @param {...*} args
 * @return {Promise}
 */
function wrapper(method, args) {
    var deferred = q.defer();
    args = [].slice.call(args, 0);
    var cp;

    args.push(function (err, stdout, stderr) {
        if (err) {
            var commandStr = args[0] + (Array.isArray(args[1]) ? (' ' + args[1].join(' ')) : '');
            err.message += ' `' + commandStr + '` (exited with error code ' + err.code + ')';
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

    cp = childProcess[method].apply(childProcess, args);

    process.nextTick(function () {
        deferred.notify(cp);
    });

    return deferred.promise;
}

/**
* `exec` as Promised
*
* @param {String} command
* @param {Object} options
* @return {Promise}
*/
function exec() {
    return wrapper('exec', arguments);
}

/**
* `execFile` as Promised
*
* @param {String} command
* @param {Array} args
* @param {Object} options
* @return {Promise}
*/
function execFile() {
    return wrapper('execFile', arguments);
}


/**
 * `spawn` as Promised
 *
 * @param {String} command
 * @param {Array} args
 * @param {Object} options
 * @return {Promise}
 */
function spawn(command, args, options) {
    var deferred = q.defer();
    var result = {};
    var cp;

    cp = childProcess.spawn(command, args, options);

    // Make sure the callee had a chance to add listeners.
    process.nextTick(function () {
        deferred.notify(cp);
    });

    // Don't return the whole Buffered result by default.
    var captureStdout = false;
    var captureStderr = false;

    var capture = options && options.capture;
    if (capture) {
        delete options.capture;
        for (var i = 0, len = capture.length; i < len; i++) {
            var cur = capture[i];
            if (cur === 'stdout') {
                captureStdout = true;
            } else if (cur === 'stderr') {
                captureStderr = true;
            }
        }
    }

    if (captureStdout) {
        result.stdout = '';

        cp.stdout.on('data', function (data) {
            result.stdout += data;
        });
    }

    if (captureStderr) {
        result.stderr = '';

        cp.stderr.on('data', function (data) {
            result.stderr += data;
        });
    }

    cp.on('error', deferred.reject);

    cp.on('close', function (code) {
        if (code !== 0) {
            var commandStr = command + (args.length ? (' ' + args.join(' ')) : '');
            var err = {
                code: code,
                message: '`' + commandStr + '` failed with code ' + code
            };

            if (captureStderr) {
                err.stderr = result.stderr.toString();
            }

            if (captureStdout) {
                err.stdout = result.stdout.toString();
            }

            deferred.reject(err);
        }
        else {
            deferred.resolve(result);
        }
    });

    return deferred.promise;
}

exports.exec = exec;
exports.execFile = execFile;
exports.spawn = spawn;
