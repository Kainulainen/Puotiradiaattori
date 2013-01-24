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

    var html = _.map(settings.counters, function(counter) {return $(createOneCounter(counter)).find('.counter').html(createSpinners(counter.digits || 4)).end();});
    var counters = socket.message.map(toJSON).splitByKey().map(counterElementAndDigitsToSpin);
    var countersWithAddedSpinners = counters.filter(hasMoreDigitsThanSpinners).do(addSpinner);
    var allMessages = counters.merge(countersWithAddedSpinners).skipDuplicates();

    $("#counters").html(html);
    showDisconnectMessage();
    sound.play();
    socket.connect();

    socket.open.onValue(showConnectedMessage);
    socket.close.onValue(showDisconnectMessage);
    socket.close.onValue(reconnect);

    countersWithAddedSpinners.onValue(function() {sound.play()});

    allMessages.onValue(spin);

    function counterElementAndDigitsToSpin(message) {
        return {'element':$('#' + _.keys(message)), 'digitsToSpin':_.values(message).toString().split('')}
    }

    function hasMoreDigitsThanSpinners(counter) {return counter.digitsToSpin.length > counter.element.find('.spinner').length;}

    function addSpinner(counter) {
        var spinners = counter.element.find('.spinner');
        var digitsToSpin = counter.digitsToSpin;
        var spinnersToAdd = spinners.length + (digitsToSpin.length - spinners.length);
        return counter.element.find('.counter').html(createSpinners(spinnersToAdd));
    }

    function spin(counter) {
        var spinners = counter.element.find('.spinner');
        var digitsToSpin = counter.digitsToSpin;
        var allDigits = $.merge(zeros(spinners.length - digitsToSpin.length), digitsToSpin).reverse();
        $(allDigits).each(rollOneSpinner);

        function rollOneSpinner(index, selectedDigit) {
            spinners.eq(index).removeClass().addClass('spinner roll-to-' + selectedDigit)
        }

        function zeros(count) {return $.map(new Array(count), function () {return '0'});}
    }

    function createOneCounter(counter) {return counterTemplate(counter)}
    function createSpinners(digits) {return _.map(_.range(digits), createOneSpinner).join('');}
    function createOneSpinner() {return spinnerTemplate();}

    function showConnectedMessage() {$('#connection').html('CONNECTED');}
    function showDisconnectMessage() {$('#connection').html('DISCONNECTED');}
    function reconnect() {setTimeout(socket.connect, 50000);}

    function toJSON(message) {return JSON.parse(message.data);}

    return {connection: socket, sound: sound};
   }}
})