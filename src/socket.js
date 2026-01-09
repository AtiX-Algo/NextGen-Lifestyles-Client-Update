// src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.PROD
  ? "https://nextgen-lifestyles-server-update.onrender.com"
  : "http://localhost:5000";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  autoConnect: true,
});

export default socket;
