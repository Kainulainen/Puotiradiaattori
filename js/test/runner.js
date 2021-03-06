require.config({
    'paths': {
        'jasmine': 'test/jasmine-1.3.1/jasmine',
        'jasmine.html': 'test/jasmine-1.3.1/jasmine-html',
        'jasmine.jquery': 'test/jasmine-1.3.1/jasmine-jquery-1.3.1'
    },
    'shim': {
        'jasmine.html': ['jasmine'],
        'jasmine.jquery': ['jasmine']
    },
    urlArgs: "bust" + (new Date()).getTime()
})

define(function (require) {
    var $ = require('jquery');
    $('<link rel="stylesheet" type="text/css" href="js/test/jasmine-1.3.1/jasmine.css" />').prependTo('head');

    require('test/puotiradiaattori.spec');
    require('test/sound.spec');

    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    var htmlReporter = new jasmine.HtmlReporter();
    jasmineEnv.addReporter(htmlReporter);
    jasmineEnv.specFilter = function (spec) {return htmlReporter.specFilter(spec);};
    jasmineEnv.execute();
});