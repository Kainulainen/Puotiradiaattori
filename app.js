require.config({
    baseUrl: 'js',
    paths: {
        'jquery': [
            'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
            'lib/jquery-1.8.3.min'
        ],
        'underscore': [
            'http://cdnjs.cloudflare.com/ajax/libs/lodash.js/1.0.0-rc.3/lodash.min',
            'lib/lodash.min'
        ],
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
require(['puotiradiaattori'], function(puotiradiaattori) {
    puotiradiaattori.init();

    var isTestEnv = document.location.href.match('runTests') != null
    if (isTestEnv)
        require(['test/runner'])
})