const os = require('os');

module.exports = function (io) {
    const netdropNamespace = io.of('/netdrop');

    const getLocalIp = () => {
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address;
                }
            }
        }
        return 'localhost';
    };

    let connectedPeers = new Map(); // socket.id -> { id, name }

    netdropNamespace.on('connection', (socket) => {
        console.log(`[NetDrop] User connected: ${socket.id}`);
        
        // Send server IP to help with discovery
        socket.emit('server-info', { ip: getLocalIp() });

        socket.on('join', (userData) => {
            const user = {
                id: socket.id,
                name: userData.name || `User_${Math.floor(Math.random() * 10000)}`
            };
            connectedPeers.set(socket.id, user);

            // Notify the new user of all existing peers
            const existingPeers = Array.from(connectedPeers.values()).filter(p => p.id !== socket.id);
            socket.emit('peer-list', existingPeers);

            // Notify all other users about the new user
            socket.broadcast.emit('peer-joined', user);
        });

        // Handle signaling data (offer, answer, ICE candidates)
        socket.on('signal', (data) => {
            const { to, signalData } = data;
            
            // Forward the signal to the specific peer
            socket.to(to).emit('signal', {
                from: socket.id,
                signalData: signalData
            });
        });

        socket.on('disconnect', () => {
            console.log(`[NetDrop] User disconnected: ${socket.id}`);
            connectedPeers.delete(socket.id);
            
            // Notify others that this user left
            socket.broadcast.emit('peer-left', socket.id);
        });
    });
};
