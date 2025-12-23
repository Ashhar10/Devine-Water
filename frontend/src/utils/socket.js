import { io } from 'socket.io-client';

// Socket URL - always use absolute URL for Render backend in production
const SOCKET_URL = import.meta.env.MODE === 'production'
    ? 'https://devine-water.onrender.com'
    : 'http://localhost:5000';

console.log('🔧 SOCKET_URL:', SOCKET_URL, 'MODE:', import.meta.env.MODE);

const socket = io(SOCKET_URL, {
    autoConnect: false
});

export const connectSocket = () => {
    socket.connect();
};

export const disconnectSocket = () => {
    socket.disconnect();
};

export default socket;
