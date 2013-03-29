define(function(require) {
   return {init: function() {
    var settings = require('settings')
    var counter = require('counter')
    var $ = require('jquery')
    var _ = require('underscore')
    var tpl = require('tpl')
    var Bacon = require('Bacon')
    Bacon.splitByKey = require('Bacon.splitByKey')
    Bacon.skipDuplicates = require('Bacon.skipDuplicates')
    var spinnerTemplate = require('tpl!spinner.html');
    var counterTemplate = require('tpl!counter.html');
    var targetTemplate = require('tpl!target.html');
    var sound = require('sound')(settings.sound)
    var socket = require('socket')(settings.serverUrl)
    var prettyDate = require('pretty')
    var storage = require('storage')

    var parsedMessages = socket.message.map(toJSON);
    var storedMessages = parsedMessages.doAction(storage.save).toProperty(initialCounterValues())

    var puoti = storedMessages.map(".puoti").splitByKey().map(counter).doAction(function(counter) {return counter.updateSpinners()});
    var timeOfLastMessage = storedMessages.map(".time").toProperty();
    var everyMinuteSinceLastMessage = timeOfLastMessage.flatMapLatest(function(time) {return Bacon.interval(60000, time)})
    var countersWithTarget = puoti.filter(function(counter) {return counter.hasTarget() });
    var targetReached = countersWithTarget.filter(function(counter) {return counter.reachedTarget() });

    $("#counters").html(_.map(settings.counters, function(counter) {return $(createOneCounter(counter))}));
    socket.connect();

    var connect = socket.close.toProperty(true);
    connect.onValue(showDisconnectMessage);
    connect.delay(10000).onValue(connectToServer);

    socket.open.onValue(playSound);
    socket.open.onValue(showConnectedMessage);

    puoti.delay(1000).onValue(function(counter) {counter.spin()});
    everyMinuteSinceLastMessage.merge(timeOfLastMessage).onValue(updateTimeSinceLastMessage);
    countersWithTarget.onValue(counter.showTargetValue);
    targetReached.onValue(playSound);

    function createOneCounter(settingsCounter) {
        return settingsCounter.target ? $(counterTemplate(settingsCounter)).append(targetTemplate(settingsCounter)).wrap('<div></div>').parent().html() : counterTemplate(settingsCounter);
    }

    function initialCounterValues() {
       var defaults = {
           'puoti': _.reduce(settings.counters, function (puoti, counter) {
               puoti[counter.id] = _.range(counter.digits).map(function () {return 0}).join('')
               return puoti
           }, {})
       }
       return _.merge(defaults, storage.fetch())
    }

    function updateTimeSinceLastMessage(time) {$('#timeSinceLastUpdate').html(prettyDate(time))}

    function showConnectedMessage() {$('#connection').html('CONNECTED');}
    function showDisconnectMessage() {$('#connection').html('DISCONNECTED');}
    function connectToServer() {socket.connect()}

    function playSound() {sound.play()}

    function toJSON(message) {return JSON.parse(message.data);}

    return {connection: socket, sound: sound};
   }}
})