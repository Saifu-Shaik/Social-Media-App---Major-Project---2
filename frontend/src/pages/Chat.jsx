import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import socket from "../socket";
import API from "../api/api";

export default function Chat() {
  const { id: receiverId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const myId = useRef(localStorage.getItem("userId")).current;

  const [chatUsers, setChatUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [receiverUser, setReceiverUser] = useState(null);

  const messagesEndRef = useRef(null);

  // ✅ Profile fallback
  const getProfilePic = (pic) => {
    return pic && pic.trim() !== ""
      ? pic
      : "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  };

  // 🔌 Join socket
  useEffect(() => {
    if (myId && socket) socket.emit("join", myId);
  }, [myId]);

  // 📩 Receive messages
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

  // 👥 Load users
  useEffect(() => {
    if (receiverId) return;

    API.get("/messages")
      .then((res) => setChatUsers(res.data))
      .catch(() => console.error("Failed to load users"));
  }, [receiverId]);

  // 💬 Load messages
  useEffect(() => {
    if (!receiverId) return;

    API.get(`/messages/${receiverId}`)
      .then((res) => setMessages(res.data))
      .catch(() => console.error("Failed to load messages"));
  }, [receiverId]);

  // 🔥 Fix header user
  useEffect(() => {
    if (!receiverId) return;

    if (location.state?.user) {
      setReceiverUser(location.state.user);
      return;
    }

    const userFromList = chatUsers.find((u) => u._id === receiverId);
    if (userFromList) {
      setReceiverUser(userFromList);
      return;
    }

    const otherUser = messages.find((m) => {
      const senderId = m.sender?._id || m.sender;
      return senderId !== myId;
    })?.sender;

    if (otherUser) setReceiverUser(otherUser);
  }, [receiverId, chatUsers, messages, location, myId]);

  // 🔽 Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 📤 Send message
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      await API.post("/messages", { receiverId, text });
      setText("");
    } catch {
      console.error("Send failed");
    }
  };

  // 🗑 Delete chat
  const deleteChat = async (userId) => {
    if (!window.confirm("Delete chat?")) return;

    try {
      await API.delete(`/messages/${userId}`);
      setChatUsers((prev) => prev.filter((u) => u._id !== userId));
      setMessages([]);

      if (receiverId === userId) navigate("/chat");
    } catch {
      console.error("Delete failed");
    }
  };

  return (
    <div className="container-fluid mt-3 px-5">
      <div className="card shadow-lg" style={{ height: "90vh" }}>
        {/* ================= USER LIST ================= */}
        {!receiverId && (
          <div className="p-3">
            <div className="d-flex align-items-center mb-3">
              {/* 🔙 BACK BUTTON */}
              <span
                style={{
                  cursor: "pointer",
                  fontSize: "25px",
                  marginRight: "15px",
                }}
                onClick={() => navigate("/Home")}
              >
                ←
              </span>

              {/* TITLE */}
              <h5 className="mb-0">Chat Users 👥 :</h5>
            </div>
            {chatUsers.map((u) => (
              <div
                key={u._id}
                className="d-flex justify-content-between align-items-center border rounded p-2 mb-2 mt-3"
              >
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={getProfilePic(u.profilePic)}
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
                    onClick={() =>
                      navigate(`/chat/${u._id}`, { state: { user: u } })
                    }
                  >
                    Open ➡️
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
          </div>
        )}

        {/* ================= CHAT ================= */}
        {receiverId && (
          <div className="d-flex flex-column h-100">
            {/* 🔥 HEADER WITH BACK BUTTON */}
            <div className="d-flex align-items-center p-3 border-bottom bg-white shadow-sm">
              {/* BACK BUTTON */}
              <span
                style={{
                  cursor: "pointer",
                  fontSize: "25px",
                  marginRight: "15px",
                }}
                onClick={() => navigate("/chat")}
              >
                ←
              </span>

              {/* PROFILE */}
              <img
                src={getProfilePic(receiverUser?.profilePic)}
                width="40"
                height="40"
                className="rounded-circle me-2"
                alt=""
              />

              {/* NAME */}
              <b>{receiverUser?.username || "User"}</b>
            </div>

            {/* 🔥 CHAT BODY */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                position: "relative",
                background: "#e5ddd5",
              }}
            >
              {/* Emoji wallpaper */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "url('https://cdn-icons-png.flaticon.com/512/742/742751.png')",
                  backgroundRepeat: "repeat",
                  backgroundSize: "100px",
                  opacity: 0.06,
                }}
              />

              <div style={{ padding: "15px", position: "relative" }}>
                {messages.map((m) => {
                  const senderId = m.sender?._id || m.sender;
                  const mine = senderId === myId;

                  const profile = getProfilePic(m.sender?.profilePic);

                  return (
                    <div
                      key={m._id}
                      className={`mb-3 d-flex ${
                        mine ? "justify-content-end" : "justify-content-start"
                      } align-items-end`}
                    >
                      {!mine && (
                        <img
                          src={profile}
                          width="32"
                          height="32"
                          className="rounded-circle me-2"
                          alt=""
                        />
                      )}

                      <div
                        style={{
                          background: mine ? "#0d6efd" : "#fff",
                          color: mine ? "#fff" : "#000",
                          padding: "10px 15px",
                          borderRadius: "15px",
                          maxWidth: "60%",
                        }}
                      >
                        {m.text}
                      </div>

                      {mine && (
                        <img
                          src={profile}
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
            </div>

            {/* 🔥 INPUT */}
            <div className="d-flex p-3 border-top bg-white">
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
          </div>
        )}
      </div>
    </div>
  );
}
