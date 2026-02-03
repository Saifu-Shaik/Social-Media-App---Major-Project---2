import { io } from "socket.io-client";

const socket = io(
  "https://social-media-app-major-project2-backend.onrender.com",
  {
    autoConnect: true,
    withCredentials: true,
    transports: ["websocket"],
    secure: true,
  },
);

export default socket;
