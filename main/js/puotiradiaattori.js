$(function () {
    var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    var digits = numbers.map(function (digit) {return '<span class="plane digit-' + digit + '"><span class="number"></span></span>';}).join('')
    var spinners = numbers.map(function () {return '<div class="spinner">' + digits + '</div>';}).join('');
    $('.counter').html(spinners);

    connectToServer();

    function connectToServer() {
        var connection = new WebSocket('ws://127.0.0.1:1337');
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
        $(selectedDigits).each(rollOneSpinner);

        function rollOneSpinner(index, selectedDigit) {
            spinners.eq(index)
                    .removeClass().addClass('spinner roll-to-' + selectedDigit)
                    .find('.plane').removeClass('selected').filter('.digit-' + selectedDigit).addClass('selected');
        }
    }
});