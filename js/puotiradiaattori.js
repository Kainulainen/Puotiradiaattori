define(function(require) {
   return {init: function() {
    var settings = require('settings')
    var counter = require('counter')
    var $ = require('jquery')
    var _ = require('underscore')
    var tpl = require('tpl')
    var Bacon = require('Bacon')
    Bacon.splitByKey = require('Bacon.splitByKey')
    var sound = require('sound')(settings.sound)
    var socket = require('socket')(settings.serverUrl)
    var prettyDate = require('pretty')
    var storage = require('storage')

    var storedMessages = socket.message.map(toJSON).doAction(storage.save).toProperty(initialCounterValues())
    var puoti = storedMessages.map(".puoti").splitByKey().map(counter)
    var newCounters = puoti.filter('.newCounter').doAction(".create")
    var countersToUpdate = newCounters.merge(puoti).doAction(".updateSpinners");  // todo fix merge & duplicates

    var timeOfLastMessage = storedMessages.map(".time").toProperty();
    var everyMinuteSinceLastMessage = timeOfLastMessage.flatMapLatest(function(time) {return Bacon.interval(60000, time)})
    var countersWithTarget = puoti.filter(".hasTarget");
    var targetReached = countersWithTarget.filter(".reachedTarget");

    var connect = socket.close.toProperty(true);
    connect.assign($("#connection"), "text", "DISCONNECTED")
    connect.delay(1000).assign(socket, "connect");

    socket.open.assign(sound, "play");
    socket.open.assign($("#connection"), "text", "CONNECTED")

    countersToUpdate.delay(1000).onValue(".spin");
    everyMinuteSinceLastMessage.merge(timeOfLastMessage).map(prettyDate).assign($('#timeSinceLastUpdate'), "text");
    countersWithTarget.onValue(".showTargetValue");
    targetReached.assign(sound, "play");

    function initialCounterValues() {
       var defaults = {
           'puoti': _.reduce(settings.counters, function (puoti, counter) {
               puoti[counter.id] = _.range(counter.digits).map(function () {return 0}).join('')
               return puoti
           }, {})
       }
       return _.merge(defaults, storage.fetch())
    }
    function toJSON(message) {return JSON.parse(message.data);}

    return {connection: socket, sound: sound};
   }}
})