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

        var digits = _.range(0, 9).map(function (digit) {return '<span class="plane digit-' + digit + '"><span class="number"></span></span>';}).join('');
        _.extend(module.counters, {
            createSpinners:function (count) {
                return $.map(_.range(count),function () {return '<div class="spinner">' + digits + '</div>';}).join('');
            }
        });

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
            $.each(JSON.parse(data), spinOneCounter);
        }

        function spinOneCounter(counterId, totalMoney) {
            var spinners = $('#' + counterId + ' .spinner');
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
