window.SocketBus = function(url) {
    var bus = new Bacon.Bus(),
        open = filterEventsBy('open'),
        close = filterEventsBy('close'),
        message = filterEventsBy('message');

    function connect() {
        var connection = new WebSocket(url);
        with (connection) onopen = onclose = onmessage = onerror = toBus;
    }

    function toBus(event) {bus.push(event);}
    function filterEventsBy(type) {return bus.filter(function(event) {return event.type === type;});}

    return {
        connect: connect,
        bus: bus,
        open: open,
        close: close,
        message: message
    }
}