define(function(require) {
   return {init: function() {
    var settings = require('settings')
    var $ = require('jquery')
    var _ = require('underscore')
    var tpl = require('tpl')
    var Bacon = require('Bacon')
    Bacon.splitByKey = require('Bacon.splitByKey')
    Bacon.skipDuplicates = require('Bacon.skipDuplicates')
    var spinnerTemplate = require('tpl!spinner.html');
    var counterTemplate = require('tpl!counter.html');
    var sound = require('sound')(settings.sound)
    var socket = require('socket')(settings.serverUrl)
    var prettyDate = require('pretty')

    var html = _.map(settings.counters, function(counter) {return $(createOneCounter(counter)).find('.counter').html(createSpinners(counter, counter.digits)).end();});

    var message = socket.message.map(toJSON);
    var allMessages = message.map(".puoti").splitByKey().doAction(updateSpinners);

    var timeOfLastMessage = message.map(".time").toProperty();
    var everyMinuteSinceLastMessage = timeOfLastMessage.flatMapLatest(function(time) {return Bacon.interval(60000, time)})
    everyMinuteSinceLastMessage.merge(timeOfLastMessage).onValue(updateTimeSinceLastMessage);

    socket.open.onValue(playSound);
    socket.open.onValue(showConnectedMessage);
    socket.close.toProperty(true).onValue(showDisconnectMessage);
    socket.error.onValue(reconnect);

    allMessages.delay(1000).onValue(spin);

    $("#counters").html(html);
    socket.connect();

   function updateSpinners(counter) {
       return byId(counter).find('.counter').html(createSpinners(counter, updatedNumberOfSpinners(counter)));
   }

   function updatedNumberOfSpinners(counter) {
       var newCount = digitsToSpin(counter).length;
       var defaultCount = defaultDigits(counter);
       return newCount > defaultCount ? newCount : defaultCount;
   }

    function spin(counter) {
        var spinners = byId(counter).find('.spinner');
        var currentDigits = digitsToSpin(counter);
        var updatedDigits = _.flatten([zeros(spinners.length - currentDigits.length), currentDigits]).reverse();
        var updatedClasses = updatedDigits.map(function(digit) {return 'spinner roll-to-' + digit });
        _.each(updatedClasses, function(updatedClass, index) {return spinners.eq(index).attr('class', updatedClass)})
     }

    function createOneCounter(counter) {return counterTemplate(counter)}
    function createSpinners(counter, digits) {return _.range(digits).map(function(element, index) {
        return spinnerTemplate({currentDigit: byId(counter).find('.spinner').eq(index).attr('class') || 'spinner roll-to-0'})}).join('');
    }
    function byId(counter) {return $('#' + id(counter));}
    function id(counter) {return _.keys(counter);}
    function digitsToSpin(counter) {return _.values(counter).toString().split('');}
    function defaultDigits(counter) {return _.find(settings.counters, function(settingsCounter) {return settingsCounter.id == id(counter)}).digits}

    function updateTimeSinceLastMessage(time) {$('#timeSinceLastUpdate').html(prettyDate(time))}

    function showConnectedMessage() {$('#connection').html('CONNECTED');}
    function showDisconnectMessage() {$('#connection').html('DISCONNECTED');}
    function reconnect() {setTimeout(socket.connect, 50000);}

    function playSound() {sound.play()}

    function toJSON(message) {return JSON.parse(message.data);}
    function zeros(count) {return _.range(count).map(function() {return '0'})}

    return {connection: socket, sound: sound};
   }}
})