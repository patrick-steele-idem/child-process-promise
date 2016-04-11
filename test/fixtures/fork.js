process.send({
    type: 'forkSuccessful'
});



if (process.argv[2] === 'ERROR') {
    process.stderr.write('ERROR');
    setTimeout(function() {
        process.exit(1);
    }, 10);
} else {
    process.stdout.write('foo');
    setTimeout(function() {
        process.exit(0);
    }, 10);
}
