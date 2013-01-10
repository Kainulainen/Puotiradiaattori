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
        'Bacon.splitByKey': ['Bacon'],
        'Bacon.skipDuplicates': ['Bacon']
    }

});
define(function(require) {
    var _ = require('underscore')
    var isProdEnv = document.location.href.match('runTests') == null
    var prodFiles = ['puotiradiaattori']
    var testFiles = _.union(prodFiles, 'test/runner')

    if (isProdEnv) {
        require(prodFiles, function (puoti) {puoti.run()})
    } else {
        require(testFiles)
    }
})