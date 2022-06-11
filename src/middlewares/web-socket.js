let interval;

function WebSocket(io) {
    io.on('connection', (socket) => {
        console.log("new client connected");
        socket.on('disconnect', () => {
            clearInterval(interval);
        });
    });
}

module.exports = WebSocket;