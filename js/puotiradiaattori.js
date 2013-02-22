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
    var targetTemplate = require('tpl!target.html');
    var sound = require('sound')(settings.sound)
    var socket = require('socket')(settings.serverUrl)
    var prettyDate = require('pretty')
    var storage = require('storage')

    var html = _.map(settings.counters, function(counter) {return $(createOneCounter(counter)).find('.counter').html(createSpinners(counter, counter.digits)).end();});

    var parsedMessages = socket.message.map(toJSON);
    var storedMessages = parsedMessages.doAction(storage.save).toProperty(storage.fetch());
    var allMessages = storedMessages.map(".puoti").splitByKey().doAction(updateSpinners);
    var timeOfLastMessage = storedMessages.map(".time").toProperty();
    var everyMinuteSinceLastMessage = timeOfLastMessage.flatMapLatest(function(time) {return Bacon.interval(60000, time)})
    var countersWithTarget = allMessages.filter(hasTarget);
    var targetReached = countersWithTarget.filter(reachedTarget);

    socket.open.onValue(playSound);
    socket.open.onValue(showConnectedMessage);
    socket.close.toProperty(true).onValue(showDisconnectMessage);
    socket.error.onValue(reconnect);
    allMessages.delay(1000).onValue(spin);

    everyMinuteSinceLastMessage.merge(timeOfLastMessage).onValue(updateTimeSinceLastMessage);

    countersWithTarget.onValue(showTargetValue);
    targetReached.onValue(playSound);

    $("#counters").html(html);
    socket.connect();

   function updateSpinners(counter) {
       return byId(counter).find('.counter').html(createSpinners(counter, updatedNumberOfSpinners(counter)));
   }

   function updatedNumberOfSpinners(counter) {
       var newCount = digitsToSpin(counter).length;
       var defaultCount = fromSettings(counter).digits;
       return newCount > defaultCount ? newCount : defaultCount;
   }

    function spin(counter) {
        var spinners = byId(counter).find('.spinner');
        var currentDigits = digitsToSpin(counter);
        var updatedDigits = _.flatten([zeros(spinners.length - currentDigits.length), currentDigits]).reverse();
        var updatedClasses = updatedDigits.map(function(digit) {return 'spinner roll-to-' + digit });
        _.each(updatedClasses, function(updatedClass, index) {return spinners.eq(index).attr('class', updatedClass)})
     }

    function showTargetValue(counter) {
       byId(counter).find('.target').addClass('show').find('.value').text(targetPercent(counter).toFixed(1) + '%').toggleClass('reached', reachedTarget(counter));
    }

    function createOneCounter(settingsCounter) {
        return settingsCounter.target ? $(counterTemplate(settingsCounter)).append(targetTemplate(settingsCounter)).wrap('<div></div>').parent().html() : counterTemplate(settingsCounter);
    }
    function createSpinners(counter, digits) {return _.range(digits).map(function(element, index) {
        return spinnerTemplate({currentDigit: byId(counter).find('.spinner').eq(index).attr('class') || 'spinner roll-to-0'})}).join('');
    }
    function byId(counter) {return $('#' + id(counter));}
    function id(counter) {return _.keys(counter);}
    function digitsToSpin(counter) {return _.values(counter).toString().split('');}

    function updateTimeSinceLastMessage(time) {$('#timeSinceLastUpdate').html(prettyDate(time))}

    function showConnectedMessage() {$('#connection').html('CONNECTED');}
    function showDisconnectMessage() {$('#connection').html('DISCONNECTED');}
    function reconnect() {setTimeout(socket.connect, 50000);}

    function playSound() {sound.play()}

    function reachedTarget(counter) {return targetPercent(counter) >= 100 }
    function targetPercent(counter) {return (_.values(counter) / fromSettings(counter).target.value) * 100;}
    function hasTarget(counter) {return typeof fromSettings(counter).target != 'undefined'}

    function fromSettings(counter) {return _.find(settings.counters, function(settingsCounter) {return settingsCounter.id == id(counter)});}
    function toJSON(message) {return JSON.parse(message.data);}
    function zeros(count) {return _.range(count).map(function() {return '0'})}

    return {connection: socket, sound: sound};
   }}
})