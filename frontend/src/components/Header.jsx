import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import socket from "../socket";

export default function Header() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD USER (REUSABLE)
  ========================= */
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

      // socket connect
      if (!socket.connected) {
        socket.connect();
        socket.emit("join", res.data._id);
      }
    } catch {
      localStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     INITIAL LOAD + TOKEN SYNC
  ========================= */
  useEffect(() => {
    loadUser();

    // 🔥 SAME TAB LOGIN / LOGOUT FIX
    window.addEventListener("auth-change", loadUser);

    // 🔥 MULTI TAB FIX
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("auth-change", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  /* =========================
     LOGOUT (NO REFRESH REQUIRED)
  ========================= */
  const logout = () => {
    localStorage.clear();
    socket.disconnect();
    setUser(null);

    // 🔥 FORCE APP TO REACT IMMEDIATELY
    window.dispatchEvent(new Event("auth-change"));

    navigate("/home", { replace: true });
  };

  /* =========================
     RENDER
  ========================= */
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
              Logout ➜]
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
