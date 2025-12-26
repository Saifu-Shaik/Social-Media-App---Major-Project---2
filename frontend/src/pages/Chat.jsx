import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";
import API from "../api/api";

export default function Chat() {
  const { id: receiverId } = useParams();
  const navigate = useNavigate();

  const myId = localStorage.getItem("userId");

  const [chatUsers, setChatUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const messagesEndRef = useRef(null);

  /* =========================
     JOIN SOCKET ONCE
  ========================= */
  useEffect(() => {
    if (myId) socket.emit("join", myId);
  }, [myId]);

  /* =========================
     SOCKET LISTENER (REALTIME)
  ========================= */
  useEffect(() => {
    const handleReceive = (msg) => {
      const senderId = msg.sender?._id || msg.sender;
      const receiver = msg.receiver?._id || msg.receiver;

      if (receiverId && (senderId === receiverId || receiver === receiverId)) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [receiverId]);

  /* =========================
     LOAD CHAT USERS
  ========================= */
  useEffect(() => {
    if (receiverId) return;

    API.get("/messages")
      .then((res) => setChatUsers(res.data))
      .catch(() => console.error("Failed to load chat users"));
  }, [receiverId]);

  /* =========================
     LOAD MESSAGES (ON OPEN)
  ========================= */
  useEffect(() => {
    if (!receiverId) return;

    API.get(`/messages/${receiverId}`)
      .then((res) => setMessages(res.data))
      .catch(() => console.error("Failed to load messages"));
  }, [receiverId]);

  /* =========================
     AUTO SCROLL
  ========================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================
     SEND MESSAGE (NO WARNING)
  ========================= */
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      await API.post("/messages", {
        receiverId,
        text,
      });

      setText(""); // socket updates UI
    } catch {
      console.error("Send message failed");
    }
  };

  /* =========================
     DELETE CHAT
  ========================= */
  const deleteChat = async (userId) => {
    if (!window.confirm("Delete entire chat?")) return;

    try {
      await API.delete(`/messages/${userId}`);

      setChatUsers((prev) => prev.filter((u) => u._id !== userId));
      setMessages([]);

      if (receiverId === userId) navigate("/chat");
    } catch {
      console.error("Delete chat failed");
    }
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="container mt-4">
      <div className="card p-3">
        {/* ===== CHAT USERS LIST ===== */}
        {!receiverId && (
          <>
            <h5>Chat Users 👥</h5>
            <br></br>
            {chatUsers.length === 0 && (
              <p className="text-muted">No conversations yet 🥺</p>
            )}
            {chatUsers.map((u) => (
              <div
                key={u._id}
                className="d-flex justify-content-between align-items-center border p-2 mb-2"
              >
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={
                      u.profilePic
                        ? `http://localhost:5000/uploads/${u.profilePic}`
                        : "https://via.placeholder.com/40"
                    }
                    width="40"
                    height="40"
                    className="rounded-circle"
                    alt=""
                  />
                  <b>{u.username}</b>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => navigate(`/chat/${u._id}`)}
                  >
                    Open Chat ➡️
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteChat(u._id)}
                  >
                    Delete 🗑️
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ===== CHAT WINDOW ===== */}
        {receiverId && (
          <>
            <div style={{ height: "350px", overflowY: "auto" }}>
              {messages.map((m) => {
                const senderId = m.sender?._id || m.sender;
                const mine = senderId === myId;

                const profilePic = m.sender?.profilePic
                  ? `http://localhost:5000/uploads/${m.sender.profilePic}`
                  : "https://via.placeholder.com/32";

                return (
                  <div
                    key={m._id}
                    className={`mb-2 d-flex ${
                      mine ? "justify-content-end" : "justify-content-start"
                    } align-items-end`}
                  >
                    {!mine && (
                      <img
                        src={profilePic}
                        width="32"
                        height="32"
                        className="rounded-circle me-2"
                        alt=""
                      />
                    )}

                    <span
                      className={`badge ${
                        mine ? "bg-primary" : "bg-secondary"
                      }`}
                      style={{ maxWidth: "60%", whiteSpace: "normal" }}
                    >
                      {m.text}
                    </span>

                    {mine && (
                      <img
                        src={profilePic}
                        width="32"
                        height="32"
                        className="rounded-circle ms-2"
                        alt=""
                      />
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="d-flex mt-2">
              <input
                className="form-control me-2"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="btn btn-primary" onClick={sendMessage}>
                Send ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
