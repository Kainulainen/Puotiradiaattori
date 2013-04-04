require.config({
    baseUrl: 'js',
    paths: {
        'jquery': [
            'http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min',
            'lib/jquery-1.9.1.min'
        ],
        'underscore': [
            'http://cdnjs.cloudflare.com/ajax/libs/lodash.js/1.1.1/lodash.min',
            'lib/lodash.min'
        ],
        'Bacon': 'lib/Bacon.min',
        'Bacon.splitByKey': 'lib/Bacon.splitByKey',
        'tpl': 'lib/tpl-custom',
        'socket': 'lib/socket',
        'sound': 'lib/sound',
        'pretty': 'lib/pretty',
        'storage': 'lib/storage'
    },
    shim: {
        'Bacon.splitByKey': ['Bacon']
    }

});
require(['puotiradiaattori'], function(puotiradiaattori) {
    puotiradiaattori();

    var isTestEnv = document.location.href.match('runTests') != null
    if (isTestEnv)
        require(['test/runner'])
})