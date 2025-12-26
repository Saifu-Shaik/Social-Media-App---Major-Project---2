import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Chat() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages(prev => [...prev, data]);
    });
  }, []);

  const send = () => {
    socket.emit("sendMessage", msg);
    setMsg("");
  };

  return (
    <div className="container">
      <h4>Chat</h4>
      {messages.map((m, i) => <p key={i}>{m}</p>)}
      <input value={msg} onChange={e => setMsg(e.target.value)} />
      <button onClick={send}>Send</button>
    </div>
  );
}
