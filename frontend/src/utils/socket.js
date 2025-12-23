import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
    autoConnect: false
});

export const connectSocket = () => {
    socket.connect();
};

export const disconnectSocket = () => {
    socket.disconnect();
};

export default socket;
