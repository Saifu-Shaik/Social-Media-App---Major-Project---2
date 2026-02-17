import { io } from "socket.io-client";

// Automatically choose backend
const URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const socket = io(URL, {
  withCredentials: true,

  // IMPORTANT: allow fallback then upgrade
  transports: ["polling", "websocket"],

  autoConnect: false,
});

export default socket;
