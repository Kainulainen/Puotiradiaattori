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

    var html = _.map(settings.counters, function(counter) {return $(createOneCounter(counter)).find('.counter').html(createSpinners(counter.digits || 4)).end();});

    var message = socket.message.map(toJSON);
    var puoti = message.map(".puoti");
    var counters = puoti.splitByKey().map(counterContainerAndDigitsToSpin);
    var needSpinnerCountChange = counters.filter(digitsAndSpinnersCountDiffer).doAction(updateSpinners);
    var allMessages = counters.merge(needSpinnerCountChange).skipDuplicates();

    var timeOfLastMessage = message.map(".time").toProperty();
    var everyMinuteSinceLastMessage = timeOfLastMessage.flatMapLatest(function(time) {return Bacon.interval(60000, time)})
    everyMinuteSinceLastMessage.merge(timeOfLastMessage).onValue(updateTimeSinceLastMessage);

    socket.open.onValue(playSound);
    socket.open.onValue(showConnectedMessage);
    socket.close.toProperty(true).onValue(showDisconnectMessage);
    socket.error.onValue(reconnect);

    needSpinnerCountChange.onValue(playSound);
    allMessages.onValue(spin);

    $("#counters").html(html);
    socket.connect();

    function counterContainerAndDigitsToSpin(message) {
        var counterId = _.keys(message);
        return {
            'id': counterId,
            'container':$('#' + counterId),
            'digitsToSpin':_.values(message).toString().split('')
        }
    }

    function digitsAndSpinnersCountDiffer(counter) {return counter.digitsToSpin.length != spinners(counter.container).length;}
    function updateSpinners(counter) {return counter.container.find('.counter').html(createSpinners(updatedNumberOfSpinners(counter)));}

   function updatedNumberOfSpinners(counter) {
       var currentCount = spinners(counter.container).length;
       var newCount = currentCount + (counter.digitsToSpin.length - currentCount);
       var defaultCount = defaultDigits(counter);
       return newCount > defaultCount ? newCount : defaultCount;
   }

   function defaultDigits(counter) {
       return _.find(settings.counters, function(settingsCounter) {return settingsCounter.id == counter.id}).digits
   }

    function spin(counter) {
        var spinnerElements = spinners(counter.container);
        var digits = _.flatten([zeros(spinnerElements.length - counter.digitsToSpin.length), counter.digitsToSpin]).reverse();
        var updatedClasses = digits.map(function(digit) {return 'spinner roll-to-' + digit });
        _.each(updatedClasses, function(updatedClass, index) {return spinnerElements.eq(index).attr('class', updatedClass)})
    }

    function createOneCounter(counter) {return counterTemplate(counter)}
    function createSpinners(digits) {return _.range(digits).map(spinnerTemplate).join('');}
    function spinners(container) {return container.find('.spinner');}

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