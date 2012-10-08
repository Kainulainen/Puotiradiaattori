$(function () {

    var serverUrl = 'ws://127.0.0.1:1337';
    var numberOfSpinnersInCounter = 10;

    $('.counter').html(createCounterMarkup());
    connectToServer();

    function createCounterMarkup() {
        var digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (digit) {return '<span class="plane digit-' + digit + '"><span class="number"></span></span>';}).join('')
        return $.map(new Array(numberOfSpinnersInCounter), function () {return '<div class="spinner">' + digits + '</div>';}).join('');
    }


    function connectToServer() {
        var connection = new WebSocket(serverUrl);
        connection.onopen = onOpen;
        connection.onclose = onClose;
        connection.onmessage = onMessage;
        connection.onerror = onError;

        function onOpen() {
            updateConnectionIndication("CONNECTED");
        }

        function onClose() {
            updateConnectionIndication("DISCONNECTED");
            setTimeout(connectToServer, 50000);
        }

        function onMessage(event) {
            $.each(JSON.parse(event.data), spinOneCounter);
        }

        function onError(event) {}

        function updateConnectionIndication(message) {
            $('#connection').html(message);
        }
    }

    function spinOneCounter(counterId, totalMoney) {
        var spinners = $('#' + counterId + ' .spinner');
        var selectedDigits = totalMoney.toString().split('');
        var allDigits = $.merge(zeros(numberOfSpinnersInCounter-selectedDigits.length), selectedDigits).reverse();
        $(allDigits).each(rollOneSpinner);

        function rollOneSpinner(index, selectedDigit) {
            spinners.eq(index)
                    .removeClass().addClass('spinner roll-to-' + selectedDigit)
                    .find('.plane').removeClass('selected').filter('.digit-' + selectedDigit).addClass('selected');
        }

        function zeros(count) {return $.map(new Array(count), function() {return '0'});}
    }
});
