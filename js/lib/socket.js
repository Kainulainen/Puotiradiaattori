define(function(require) {
    var Bacon = require('Bacon');
    return function(url) {
        var bus = new Bacon.Bus(),
            open = filterEventsBy('open'),
            close = filterEventsBy('close'),
            message = filterEventsBy('message'),
            error = filterEventsBy('error');

        function connect() {
            var connection = new WebSocket(url);
            with (connection) onopen = onclose = onmessage = onerror = bus.push;
        }
        function filterEventsBy(type) {return bus.filter(function(event) {return event.type === type;});}

        return {
            connect: connect,
            bus: bus,
            open: open,
            close: close,
            message: message,
            error: error
        }
    }
});