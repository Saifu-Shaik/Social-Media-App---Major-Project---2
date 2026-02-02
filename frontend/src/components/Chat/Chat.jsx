import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_BACKEND_URL
  ? process.env.REACT_APP_BACKEND_URL
  : "http://localhost:5000";

const socket = io(SOCKET_URL, {
  transports: ["websocket"], // important for Render
});

export default function Chat() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    socket.on("connect", () => {
      console.log("🟢 Connected to socket:", socket.id);
    });

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const send = () => {
    if (!msg.trim()) return;

    socket.emit("sendMessage", {
      senderId: localStorage.getItem("userId") || "guest",
      receiverId: "global", // or replace with real receiver later
      text: msg,
    });

    setMsg("");
  };

  return (
    <div className="container mt-4">
      <h4>Chat</h4>

      <div className="border p-3 mb-3" style={{ minHeight: "200px" }}>
        {messages.length === 0 ? (
          <p className="text-muted">No messages yet...</p>
        ) : (
          messages.map((m, i) => (
            <p key={i}>
              <b>{m.sender}:</b> {m.text}
            </p>
          ))
        )}
      </div>

      <input
        className="form-control mb-2"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Type a message..."
      />

      <button className="btn btn-primary" onClick={send}>
        Send
      </button>
    </div>
  );
}
