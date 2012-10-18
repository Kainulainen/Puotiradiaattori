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

        $("#counters").html(_.map(module.counters, function(counter) {
            return $(_.template($("#counter").html(), counter)).find('.counter').html(createSpinners(counter.digits)).end();
        }));

        function createSpinners(digits) {return _.map(_.range(digits), createOneSpinner).join('');}

        function createOneSpinner() {return _.template($("#spinner").html(), {});}

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
            $.each(JSON.parse(data), function (counterId, totalMoney) {
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
