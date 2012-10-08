var Puotiradiaattori = {
    init: function (serverUrl) {
        Puotiradiaattori.serverUrl = serverUrl;
        $('.counter').html(createCounterMarkup());
        Puotiradiaattori.connectToServer();

        function createCounterMarkup() {
            var numberOfSpinnersInCounter = 10;
            var digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (digit) {return '<span class="plane digit-' + digit + '"><span class="number"></span></span>';}).join('');
            return $.map(new Array(numberOfSpinnersInCounter),function () {return '<div class="spinner">' + digits + '</div>';}).join('');
        }
    },
    connectToServer: function () {
        var connection = new WebSocket(Puotiradiaattori.serverUrl);
        connection.onopen = Puotiradiaattori.connect;
        connection.onclose = Puotiradiaattori.disconnect;
        connection.onmessage = function(event) {Puotiradiaattori.updateCounters(event.data)};
    },
    connect: function () {
        $('#connection').html('CONNECTED');
    },
    disconnect: function () {
        $('#connection').html('DISCONNECTED');
        setTimeout(Puotiradiaattori.connectToServer, 50000);
    },
    updateCounters: function (data) {
        $.each(JSON.parse(data), Puotiradiaattori.spinOneCounter);
    },
    spinOneCounter:function (counterId, totalMoney) {
        var spinners = $('#' + counterId + ' .spinner');
        var selectedDigits = totalMoney.toString().split('');
        var allDigits = $.merge(zeros(spinners.length - selectedDigits.length), selectedDigits).reverse();
        $(allDigits).each(rollOneSpinner);

        function rollOneSpinner(index, selectedDigit) {
            spinners.eq(index).removeClass().addClass('spinner roll-to-' + selectedDigit)
        }

        function zeros(count) {return $.map(new Array(count), function () {return '0'});}
    }
}