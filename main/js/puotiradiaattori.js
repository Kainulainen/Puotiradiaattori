var Config = {
    'serverUrl':'ws://127.0.0.1:1337',
    'counters':[
        {'label':'tänään', 'id':'today', digits:10},
        {'label':'viikko', 'id':'week', digits:10},
        {'label':'kuukausi', 'id':'month', digits:10},
        {'label':'vuosi', 'id':'year', digits:10},
        {'label':'kaikki', 'id':'total', digits:10}
    ]
}

$(function () {
    window.Puotiradiaattori = (function (module) {
        var singleDigit = '<span class="plane digit-<%= digit %>"><span class="number"></span></span>';
        var spinner = '<div class="spinner"><%= allDigits %></div>';

        var allDigits = _.range(10).map(function (digit) {return _.template(singleDigit, {digit:digit});}).join('');
        var createSpinners = function(count) {return _.range(count).map(function () {return _.template(spinner, {allDigits:allDigits});}).join('')};
        _.extend(module.counters, {createSpinners:createSpinners});

        $('#counters').html(_.template($("#counter").html(), module.counters));

        module.connectToServer = function () {
            var connection = new WebSocket(module.serverUrl);
            connection.onopen = module.connect;
            connection.onclose = module.disconnect;
            connection.onmessage = module.message;
        }
        module.connect = function () {
            $('#connection').html('CONNECTED');
        }
        module.disconnect = function () {
            $('#connection').html('DISCONNECTED');
            setTimeout(module.connectToServer, 50000);
        }
        module.message = function (event) {
            module.updateCounters(event.data);
        }
        module.updateCounters = function (data) {
            $.each(JSON.parse(data), function(counterId, totalMoney) {
                $('#' + counterId).find('.total').text(totalMoney);

                var spinners = $('#' + counterId).find('.spinner');
                var selectedDigits = totalMoney.toString().split('');
                if (selectedDigits.length > spinners.length) {
                    addSpinners(counterId, spinners.length + (selectedDigits.length - spinners.length));
                }
                spinOneCounter(counterId, totalMoney);
            });
        }

        function addSpinners(counterId, count) {
            $('#' + counterId).find('.counter').html(createSpinners(count));
        }

        function spinOneCounter(counterId, totalMoney) {
            var spinners = $('#' + counterId).find('.spinner');
            var selectedDigits = totalMoney.toString().split('');
            var allDigits = $.merge(zeros(spinners.length - selectedDigits.length), selectedDigits).reverse();
            $(allDigits).each(rollOneSpinner);

            function rollOneSpinner(index, selectedDigit) {
                spinners.eq(index).removeClass().addClass('spinner roll-to-' + selectedDigit)
            }

            function zeros(count) {return $.map(new Array(count), function () {return '0'});}
        }

        return module;

    })(Config);
    Puotiradiaattori.connectToServer();
});
