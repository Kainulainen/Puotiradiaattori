require.config({
    paths: {
        'jquery': 'lib/jquery-1.8.3.min',
        'underscore': 'lib/lodash.min',
        'Bacon': 'lib/Bacon.min',
        'Bacon.splitByKey': 'lib/Bacon.splitByKey',
        'Bacon.skipDuplicates': 'lib/Bacon.skipDuplicates',
        'tpl': 'lib/tpl-custom',
        'socket': 'lib/socket',
        'sound': 'lib/sound'
    },
    shim: {
        'underscore': {exports: '_'},
        'Bacon.splitByKey': ['Bacon'],
        'Bacon.skipDuplicates': ['Bacon']
    }

});
(function () {
    var prodFiles = ['puotiradiaattori']
    var testFiles = ['puotiradiaattori', 'test/runner']
    var isTestEnv = document.location.href.match('runTests') != null;

    if (isTestEnv) {
        require(testFiles)
    } else {
        require(prodFiles, function (puoti) {
            puoti.run()
        })
    }
})()