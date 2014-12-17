var child_process = require('child_process');
var wrap = require('lodash.wrap');
var q = require('q');

/**
 * exec as Promised
 *
 * @param {String} command
 * @param {Object} options
 * @return {Promise}
 */
var exec = wrap('exec', wrapper);

/**
 * execFile as Promised
 *
 * @param {String} command
 * @param {Array} args
 * @param {Object} options
 * @return {Promise}
 */
var execFile = wrap('execFile', wrapper);

/**
 * Promise wrapper for exec, execFile
 *
 * @param {String} method
 * @param {...*} args
 * @return {Promise}
 */
function wrapper(method /*, args... */) {
    var deferred = q.defer();
    var args = [].slice.call(arguments, 1);
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

    cp = child_process[method].apply(child_process, args);

    process.nextTick(function () {
        deferred.notify(cp);
    });

    return deferred.promise;
}

/**
 * spawn as Promised
 *
 * @param {String} command
 * @param {Array} args
 * @param {Object} options
 * @return {Promise}
 */
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
                message: '`' + commandStr + '` failed with code ' + code
            });
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
