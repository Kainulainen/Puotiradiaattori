define(function(require) {
   return function() {
    var settings = require('settings')
    var counter = require('counter')
    var $ = require('jquery')
    var _ = require('_')
    var Bacon = require('Bacon')
    require('Bacon.splitByKey')
    var sound = require('sound')(settings.sound)
    var socket = require('socket')(settings.serverUrl)
    var prettyDate = require('pretty')
    var storage = require('storage')

    var storedMessages = socket.message.map(toJSON).toProperty(initialCounterValues())
    var puoti = storedMessages.map(".puoti").splitByKey().map(counter)
    var newCounters = puoti.filter('.newCounter')
    var timeOfLastMessage = storedMessages.map(".time")
    var everyMinuteSinceLastMessage = timeOfLastMessage.flatMapLatest(function(time) {return Bacon.interval(60000, time)})
    var countersWithTarget = puoti.filter(".hasTarget")
    var targetReached = countersWithTarget.filter(".reachedTarget")

    var connect = socket.close.toProperty(true)
    connect.assign($("#connection"), "text", "DISCONNECTED")
    connect.delay(1000).assign(socket, "connect")

    socket.open.assign(sound, "play")
    socket.open.assign($("#connection"), "text", "CONNECTED")

    storedMessages.onValue(storage.save)
    newCounters.onValue(".create")
    puoti.onValue(".updateSpinners")
    puoti.delay(1).onValue(".spin")
    everyMinuteSinceLastMessage.merge(timeOfLastMessage).map(prettyDate).assign($('#timeSinceLastUpdate'), "text")
    countersWithTarget.onValue(".showTargetValue")
    targetReached.assign(sound, "play")

    function initialCounterValues() {
       var allToZero = {'puoti': _.reduce(settings.counters, setZeroAsStartingValue, {})}
       return _.merge(allToZero, storage.fetch())
    }
    function setZeroAsStartingValue(puoti, counter) {
       puoti[counter.id] = 0
       return puoti
    }

    function toJSON(message) {return JSON.parse(message.data)}

    return {connection: socket, sound: sound}
   }
})