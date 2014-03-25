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

    var messages = socket.message.map('.data').map(JSON.parse).toProperty(initialCounterValues())
    var puoti = messages.map('.puoti').splitByKey().map(counter).delay(1)
    var newCounters = puoti.filter('.newCounter')
    var timeOfLastMessage = messages.map('.time').toEventStream()
    var timeOfLastMessageRepeatedlyEveryMinute = timeOfLastMessage.flatMapLatest(repeatedlyEveryMinute)
    var formattedTimeOfLastMessage = timeOfLastMessageRepeatedlyEveryMinute.merge(timeOfLastMessage).map(prettyDate)
    var countersWithTarget = puoti.filter('.hasTarget')
    var targetReached = countersWithTarget.filter('.reachedTarget')

    var disconnect = socket.close.toProperty(true)
    disconnect.onValue(disconnectIndication)
    disconnect.delay(1000).assign(socket, 'connect')

    socket.open.assign(sound, 'play')
    socket.open.onValue(connectedIndication)

    messages.onValue(storage.save)
    newCounters.onValue('.create')
    puoti.onValue('.updateSpinners')
    puoti.delay(1).onValue('.spin')
    formattedTimeOfLastMessage.assign($('#timeSinceLastUpdate'), 'text')
    countersWithTarget.onValue('.showTargetValue')
    targetReached.assign(sound, 'play')

    function initialCounterValues() {
       var allToZero = {'puoti': _.reduce(settings.counters, setZeroAsStartingValue, {})}
       return _.merge(allToZero, storage.fetch())
    }
    function setZeroAsStartingValue(puoti, counter) {
       puoti[counter.id] = 0
       return puoti
    }
    function repeatedlyEveryMinute(message) {return Bacon.interval(60000, message)}

    function disconnectIndication() { $('#connection').text('DISCONNECTED').addClass('disconnected') }
    function connectedIndication() { $('#connection').text('CONNECTED').removeClass('disconnected') }

    return {connection: socket, sound: sound}
   }

})