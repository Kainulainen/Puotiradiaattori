window.Socket = function(url, onOpen, onClose, onMessage) {

    connectToServer();

    function connectToServer() {
        var connection = new WebSocket(url);
        connection.onopen = onOpen;
        connection.onclose = onClose;
        connection.onmessage = onMessage;
    }

    return {
        reconnect: connectToServer,
        connect: onOpen,
        disconnect: onClose,
        message: onMessage
    }
}