// src/socket.js
import io from 'socket.io-client';

// Connect to your backend URL
const socket = io("http://localhost:5000", {
    withCredentials: true,
    autoConnect: true
});

export default socket;