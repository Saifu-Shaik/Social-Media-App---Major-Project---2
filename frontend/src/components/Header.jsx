import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import socket from "../socket";

export default function Header() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await API.get("/users/profile");

      setUser(res.data);
      localStorage.setItem("userId", res.data._id);

      // ✅ Safer Socket handling for Render
      if (socket && !socket.connected) {
        socket.connect();
      }

      if (socket?.connected) {
        socket.emit("join", res.data._id);
      }
    } catch {
      localStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    window.addEventListener("auth-change", loadUser);
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("auth-change", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const logout = () => {
    localStorage.clear();

    if (socket?.connected) {
      socket.disconnect();
    }

    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    navigate("/home", { replace: true });
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/home">
        ● Social Media App
      </Link>

      <div className="d-flex align-items-center gap-2">
        {loading ? null : !user ? (
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => navigate("/signup")}
          >
            Signup / Login 👉
          </button>
        ) : (
          <>
            <Link className="btn btn-outline-light btn-sm" to="/home">
              Home 🏠︎
            </Link>

            <Link className="btn btn-outline-light btn-sm" to="/chat">
              Chat 💬
            </Link>

            <Link className="btn btn-outline-light btn-sm" to="/profile">
              Profile 👨🏻‍💼
            </Link>

            <span className="text-white ms-2">
              Welcome ! <b>{user.username} 👤</b>
            </span>

            <button className="btn btn-sm btn-danger ms-2" onClick={logout}>
              Logout ➜
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
