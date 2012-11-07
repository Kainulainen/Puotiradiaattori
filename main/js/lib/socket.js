window.SocketBus = function(url) {
    var bus = new Bacon.Bus(),
        open = filterEventsBy('open'),
        close = filterEventsBy('close'),
        messages = filterEventsBy('message');

    function connect() {
        var connection = new WebSocket(url);
        connection.onopen = toBus;
        connection.onclose = toBus;
        connection.onmessage = toBus;
    }

    function toBus(event) {bus.push(event);}
    function filterEventsBy(type) {return bus.filter(function(event) {return event.type === type;});}

    return {
        connect: connect,
        bus: bus,
        open: open,
        close: close,
        messages: messages
    }
}