import { io } from 'socket.io-client';

// Use environment variable in production, local in development
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ||
    (import.meta.env.PROD
        ? 'https://devine-water.onrender.com'
        : 'http://localhost:5000');

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
