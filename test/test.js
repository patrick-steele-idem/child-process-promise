'use strict';
require('chai').config.includeStack = true;
var expect = require('chai').expect;
var assert = require('chai').assert;

var path = require('path');

var childProcessPromise = require('../');

var ChildProcessPromise;
var ChildProcessError;

if (require('node-version').major >= 4) {
    ChildProcessPromise = require('../lib/ChildProcessPromise');
    ChildProcessError = require('../lib/ChildProcessError');
} else {
    ChildProcessPromise = require('../lib-es5/ChildProcessPromise');
    ChildProcessError = require('../lib-es5/ChildProcessError');
}

var Promise;

if (require('node-version').major >= 4) {
    Promise = global.Promise;
} else {
    // Don't use the native Promise in Node.js <4 since it doesn't support subclassing
    Promise = require('promise-polyfill');
}

var NODE_VERSION = process.version;
var NODE_PATH = process.argv[0];

describe('child-process-promise', function() {
    describe('exec', function() {
        it('should return a promise', function(done) {
            var fooPath = path.join(__dirname, 'fixtures/foo.txt');
            var promise = childProcessPromise.exec('cat ' + fooPath);
            expect(promise.then).to.be.a('function');
            expect(promise).to.be.an.instanceof(ChildProcessPromise);
            expect(promise).to.be.an.instanceof(Promise);
            done();
        });

        it('should expose the `childProcess` object on the returned promise', function(done) {
            var fooPath = path.join(__dirname, 'fixtures/foo.txt');
            var promise = childProcessPromise.exec('cat ' + fooPath);
            expect(promise.childProcess.pid).to.be.a('number');
            done();
        });

        it('should resolve with process info', function(done) {
            var fooPath = path.join(__dirname, 'fixtures/foo.txt');
            var promise = childProcessPromise.exec('cat ' + fooPath);
            var childProcess = promise.childProcess;

            promise
                .then(function(result) {
                    expect(result.stdout).to.equal('foo');
                    expect(result.stderr).to.equal('');
                    expect(result.childProcess).to.be.an('object');
                    expect(result.childProcess).to.equal(childProcess);
                    done();
                })
                .catch(done);
        });

        it('should handle rejection correctly with catch', function(done) {
            var missingFilePath = path.join(__dirname, 'THIS_FILE_DOES_NOT_EXIST');
            var promise = childProcessPromise.exec('cat ' + missingFilePath);

            promise
                .then(function(result) {
                    done(new Error('rejection was expected but it completed successfully!'));
                })
                .catch(function(e) {
                    expect(e.toString()).to.contain(missingFilePath);
                    done();
                })
                .catch(done);
        });

        it('should handle rejection correctly with fail', function(done) {
            var missingFilePath = path.join(__dirname, 'THIS_FILE_DOES_NOT_EXIST');
            var promise = childProcessPromise.exec('cat ' + missingFilePath);

            promise
                .then(function(result) {
                    done(new Error('rejection was expected but it completed successfully!'));
                })
                .fail(function(e) {
                    expect(e.toString()).to.contain(missingFilePath);
                    done();
                })
                .catch(done);
        });

        it('should be compatible with previous version of child-process-promise', function(done) {
            var childProcessPid;

            childProcessPromise.exec('echo hello')
                .then(function(result) {
                    var stdout = result.stdout;
                    var stderr = result.stderr;

                    assert.equal(stdout.toString(), 'hello\n');
                    assert.equal(stderr.toString(), '');
                    expect(childProcessPid).to.be.a('number');
                    done();
                })
                .fail(function(err) {
                    console.error('ERROR: ', (err.stack || err));
                })
                .progress(function(childProcess) {
                    childProcessPid = childProcess.pid;
                })
                .done();
        });
    });

    describe('execFile', function() {
        it('should return a promise', function(done) {
            var promise = childProcessPromise.execFile(NODE_PATH, ['--version']);
            expect(promise.then).to.be.a('function');
            expect(promise).to.be.an.instanceof(ChildProcessPromise);
            expect(promise).to.be.an.instanceof(Promise);
            done();
        });

        it('should expose the `childProcess` object on the returned promise', function(done) {
            var promise = childProcessPromise.execFile(NODE_PATH, ['--version']);
            expect(promise.childProcess.pid).to.be.a('number');
            done();
        });

        it('should resolve with process info', function(done) {
            var promise = childProcessPromise.execFile(NODE_PATH, ['--version']);
            var childProcess = promise.childProcess;

            promise
                .then(function(result) {
                    expect(result.stdout).to.contain(NODE_VERSION);
                    expect(result.stderr).to.equal('');
                    expect(result.childProcess).to.be.an('object');
                    expect(result.childProcess).to.equal(childProcess);
                    done();
                })
                .catch(done);
        });

        it('should handle rejection correctly with catch', function(done) {
            var missingFilePath = path.join(__dirname, 'THIS_FILE_DOES_NOT_EXIST');
            var promise = childProcessPromise.execFile(missingFilePath, ['foo']);

            promise
                .then(function(result) {
                    done(new Error('rejection was expected but it completed successfully!'));
                })
                .catch(function(e) {
                    expect(e.toString()).to.contain(missingFilePath);
                    done();
                })
                .catch(done);
        });

        it('should handle rejection correctly with fail', function(done) {
            var missingFilePath = path.join(__dirname, 'THIS_FILE_DOES_NOT_EXIST');
            var promise = childProcessPromise.execFile(missingFilePath, ['foo']);

            promise
                .then(function(result) {
                    done(new Error('rejection was expected but it completed successfully!'));
                })
                .fail(function(e) {
                    expect(e).to.be.an.instanceof(ChildProcessError);
                    expect(e.toString()).to.contain(missingFilePath);
                    expect(e.code).to.equal('ENOENT');
                    done();
                })
                .catch(done);
        });

        it('should be compatible with previous version of child-process-promise', function(done) {
            var childProcessPid;

            childProcessPromise.execFile(NODE_PATH, ['--version'])
                .then(function(result) {
                    var stdout = result.stdout;
                    var stderr = result.stderr;

                    expect(stdout).to.contain(NODE_VERSION);
                    assert.equal(stderr.toString(), '');
                    expect(childProcessPid).to.be.a('number');
                    done();
                })
                .progress(function(childProcess) {
                    childProcessPid = childProcess.pid;
                })
                .done();
        });
    });

    describe('spawn', function() {
        it('should return a promise', function(done) {
            var fooPath = path.join(__dirname, 'fixtures/foo.txt');
            var promise = childProcessPromise.spawn('cat', [fooPath]);
            expect(promise.then).to.be.a('function');
            expect(promise).to.be.an.instanceof(ChildProcessPromise);
            expect(promise).to.be.an.instanceof(Promise);
            done();
        });

        it('should expose the `childProcess` object on the returned promise', function(done) {
            var fooPath = path.join(__dirname, 'fixtures/foo.txt');
            var promise = childProcessPromise.spawn('cat', [fooPath]);
            expect(promise.childProcess.pid).to.be.a('number');
            done();
        });

        it('should resolve with process info', function(done) {
            var fooPath = path.join(__dirname, 'fixtures/foo.txt');
            var promise = childProcessPromise.spawn('cat', [fooPath]);
            var childProcess = promise.childProcess;

            childProcess.on('close', function(code) {
                expect(code).to.equal(0);
                done();
            });

            promise
                .then(function(result) {
                    expect(result.childProcess).to.be.an('object');
                    expect(result.childProcess).to.equal(childProcess);
                })
                .catch(done);
        });

        it('should support the "capture" (stdout only) option for spawn', function(done) {
            var fooPath = path.join(__dirname, 'fixtures/foo.txt');
            var promise = childProcessPromise.spawn('cat', [fooPath], { capture: ['stdout'] });
            var childProcess = promise.childProcess;

            promise
                .then(function(result) {
                    expect(result.stdout).to.equal('foo');
                    expect(result.stderr).to.equal(undefined);
                    expect(result.childProcess).to.be.an('object');
                    expect(result.childProcess).to.equal(childProcess);
                    done();
                })
                .catch(done);
        });

        it('should support the "capture" (stdout and stderr) option for spawn', function(done) {
            var fooPath = path.join(__dirname, 'fixtures/foo.txt');
            var promise = childProcessPromise.spawn('cat', [fooPath], { capture: ['stdout', 'stderr'] });
            var childProcess = promise.childProcess;

            promise
                .then(function(result) {
                    expect(result.stdout).to.equal('foo');
                    expect(result.stderr).to.equal('');
                    expect(result.childProcess).to.be.an('object');
                    expect(result.childProcess).to.equal(childProcess);
                    done();
                })
                .catch(done);
        });

        it('should support the "capture" (stdout and stderr) option for spawn with rejection', function(done) {
            var missingFilePath = path.join(__dirname, 'THIS_FILE_DOES_NOT_EXIST');
            var promise = childProcessPromise.spawn('cat', [missingFilePath], { capture: ['stdout', 'stderr'] });
            var childProcess = promise.childProcess;

            promise
                .then(function(result) {
                    done(new Error('rejection expected!'));
                })
                .catch(function(error) {
                    expect(error).to.be.an.instanceof(ChildProcessError);
                    expect(error.stdout).to.equal('');
                    expect(error.stderr).to.contain(missingFilePath);
                    expect(error.childProcess).to.be.an('object');
                    expect(error.childProcess).to.equal(childProcess);
                    done();
                })
                .done();
        });

        it('should handle rejection correctly with catch', function(done) {
            var missingFilePath = path.join(__dirname, 'THIS_FILE_DOES_NOT_EXIST');
            var promise = childProcessPromise.spawn('cat', [missingFilePath]);

            promise
                .then(function(result) {
                    done(new Error('rejection was expected but it completed successfully!'));
                })
                .catch(function(e) {
                    expect(e).to.be.an.instanceof(ChildProcessError);
                    expect(e.toString()).to.contain(missingFilePath);
                    done();
                })
                .catch(done);
        });

        it('should handle rejection correctly with fail', function(done) {
            var missingFilePath = path.join(__dirname, 'THIS_FILE_DOES_NOT_EXIST');
            var promise = childProcessPromise.spawn('cat', [missingFilePath]);

            promise
                .then(function(result) {
                    done(new Error('rejection was expected but it completed successfully!'));
                })
                .fail(function(e) {
                    expect(e).to.be.an.instanceof(ChildProcessError);
                    expect(e.toString()).to.contain(missingFilePath);
                    done();
                })
                .catch(done);
        });

        it('should be compatible with previous version of child-process-promise', function(done) {
            var spawnOut = '';
            var spawnErr = '';
            childProcessPromise.spawn('echo', ['hello'])
                .progress(function(childProcess) {
                    childProcess.stdout.on('data', function(data) {
                        spawnOut += data;
                    });
                    childProcess.stderr.on('data', function(data) {
                        spawnErr += data;
                    });
                })
                .then(function() {
                    assert.equal(spawnOut.toString(), 'hello\n');
                    assert.equal(spawnErr.toString(), '');
                    done();
                })
                .done();
        });

        it('should not reject when writing to stderr', function(done) {
            var scriptPath = path.join(__dirname, 'fixtures/stderr.js');
            var promise = childProcessPromise.spawn('node', [scriptPath]);

            promise
                .then(function(result) {
                    done();
                })
                .catch(done);
        });

        it('should provide the exit code for success', function(done) {
            var fooPath = path.join(__dirname, 'fixtures/foo.txt');
            var promise = childProcessPromise.spawn('cat', [fooPath]);
            promise.then(function(result) {
                    expect(result.code).to.equal(0);
                })
                .catch(done);
            done();
        });
    });


    describe('fork', function() {
        it('should return a promise', function(done) {
            var scriptpath = path.join(__dirname, 'fixtures/fork.js');
            var promise = childProcessPromise.fork(scriptpath, ['foo']);
            expect(promise.then).to.be.a('function');
            expect(promise).to.be.an.instanceof(ChildProcessPromise);
            expect(promise).to.be.an.instanceof(Promise);
            done();
        });

        it('should expose the `childProcess` object on the returned promise', function(done) {
            var scriptpath = path.join(__dirname, 'fixtures/fork.js');
            var promise = childProcessPromise.fork(scriptpath, ['foo']);
            expect(promise.childProcess.pid).to.be.a('number');
            done();
        });

        it('should resolve with process info', function(done) {
            var scriptpath = path.join(__dirname, 'fixtures/fork.js');
            var promise = childProcessPromise.fork(scriptpath, ['foo']);
            var childProcess = promise.childProcess;

            childProcess.on('close', function(code) {
                expect(code).to.equal(0);
                done();
            });

            promise
                .then(function(result) {
                    expect(result.childProcess).to.be.an('object');
                    expect(result.childProcess).to.equal(childProcess);
                })
                .catch(done);
        });

        it('should support the "capture" (stdout only) option for fork', function(done) {
            var scriptpath = path.join(__dirname, 'fixtures/fork.js');
            var promise = childProcessPromise.fork(scriptpath, ['foo'], {
                silent: true,
                capture: ['stdout']
            });

            var childProcess = promise.childProcess;

            promise
                .then(function(result) {
                    expect(result.stdout).to.equal('foo');
                    expect(result.stderr).to.equal(undefined);
                    expect(result.childProcess).to.be.an('object');
                    expect(result.childProcess).to.equal(childProcess);
                    done();
                })
                .catch(done);
        });

        it('should support the "capture" (stdout and stderr) option for fork', function(done) {
            var scriptpath = path.join(__dirname, 'fixtures/fork.js');
            var promise = childProcessPromise.fork(scriptpath, ['foo'], {
                silent: true,
                capture: ['stdout', 'stderr']
            });

            var childProcess = promise.childProcess;

            promise
                .then(function(result) {
                    expect(result.stdout).to.equal('foo');
                    expect(result.stderr).to.equal('');
                    expect(result.childProcess).to.be.an('object');
                    expect(result.childProcess).to.equal(childProcess);
                    done();
                })
                .catch(done);
        });

        it('should support the "capture" (stdout and stderr) option for fork with rejection', function(done) {
            var scriptpath = path.join(__dirname, 'fixtures/fork.js');
            var promise = childProcessPromise.fork(scriptpath, ['ERROR'], {
                silent: true,
                capture: ['stdout', 'stderr']
            });

            var childProcess = promise.childProcess;

            promise
                .then(function(result) {
                    done(new Error('rejection expected!'));
                })
                .catch(function(error) {
                    expect(error).to.be.an.instanceof(ChildProcessError);
                    expect(error.stdout).to.equal('');
                    expect(error.stderr).to.equal('ERROR');
                    expect(error.childProcess).to.be.an('object');
                    expect(error.childProcess).to.equal(childProcess);
                    done();
                })
                .done();
        });

        it('should handle rejection correctly with catch', function(done) {
            var missingFilePath = path.join(__dirname, 'THIS_FILE_DOES_NOT_EXIST');
            var promise = childProcessPromise.fork(missingFilePath, [], { silent: true });

            promise
                .then(function(result) {
                    done(new Error('rejection was expected but it completed successfully!'));
                })
                .catch(function(e) {
                    expect(e).to.be.an.instanceof(ChildProcessError);
                    expect(e.code).to.equal(1);
                    expect(e.toString()).to.contain(missingFilePath);
                    done();
                })
                .catch(done);
        });

        it('should handle rejection correctly with fail', function(done) {
            var missingFilePath = path.join(__dirname, 'THIS_FILE_DOES_NOT_EXIST');
            var promise = childProcessPromise.fork(missingFilePath, [], { silent: true });

            promise
                .then(function(result) {
                    done(new Error('rejection was expected but it completed successfully!'));
                })
                .fail(function(e) {
                    expect(e).to.be.an.instanceof(ChildProcessError);
                    expect(e.toString()).to.contain(missingFilePath);
                    done();
                })
                .catch(done);
        });

        it('should receive message from child', function(done) {
            var scriptpath = path.join(__dirname, 'fixtures/fork.js');
            var promise = childProcessPromise.fork(scriptpath, ['foo']);

            var forkSuccessfulReceived = false;

            promise.childProcess.on('message', function(message) {
                if (message && message.type === 'forkSuccessful') {
                    forkSuccessfulReceived = true;
                }
            });

            promise
                .then(function() {
                    assert.equal(forkSuccessfulReceived, true);
                    done();
                })
                .done();
        });

        it('should receive message from child when using "progress"', function(done) {
            var scriptpath = path.join(__dirname, 'fixtures/fork.js');
            var promise = childProcessPromise.fork(scriptpath, ['foo']);

            var forkSuccessfulReceived = false;

            promise
                .progress(function(childProcess) {
                    childProcess.on('message', function(message) {
                        if (message && message.type === 'forkSuccessful') {
                            forkSuccessfulReceived = true;
                        }
                    });
                })
                .then(function() {
                    assert.equal(forkSuccessfulReceived, true);
                    done();
                })
                .done();
        });
    });

});