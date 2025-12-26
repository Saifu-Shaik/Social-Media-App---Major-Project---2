import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: true,
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;
