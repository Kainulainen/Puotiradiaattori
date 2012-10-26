window.Socket = function(url, onOpen, onClose, onMessage) { 
    function connectToServer() {
        var connection = new WebSocket(url);
        connection.onopen = onOpen;
        connection.onclose = onClose;
        connection.onmessage = onMessage;
    }
    return {
        connect: connectToServer,
        open: onOpen,
        close: onClose,
        message: onMessage
    }
}