var Config = {
    'serverUrl':'ws://127.0.0.1:1337',
    'sound': true,
    'counters':[
        {'label':'tänään', 'id':'today', digits:10},
        {'label':'viikko', 'id':'week', digits:10},
        {'label':'kuukausi', 'id':'month', digits:10},
        {'label':'vuosi', 'id':'year', digits:10},
        {'label':'kaikki', 'id':'total', digits:10}
    ]
}

var Puotiradiaattori = function (settings) {
    var html = _.map(settings.counters, function(counter) {return $(createOneCounter(counter)).find('.counter').html(createSpinners(counter.digits)).end();});
    var sound = Sound(settings.sound);
    var socket = SocketBus(settings.serverUrl);

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

    function createOneCounter(counter) {return _.template($("#counter").html(), counter)}
    function createSpinners(digits) {return _.map(_.range(digits), createOneSpinner).join('');}
    function createOneSpinner() {return _.template($("#spinner").html(), {});}

    function showConnectedMessage() {$('#connection').html('CONNECTED');}
    function showDisconnectMessage() {$('#connection').html('DISCONNECTED');}
    function reconnect() {setTimeout(socket.connect, 50000);}

    function toJSON(message) {return JSON.parse(message.data);}

    return {connection: socket, sound: sound};

};
Puotiradiaattori(Config);