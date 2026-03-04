import { useState, useEffect } from "react";
import API from "../../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [popup, setPopup] = useState("");
  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => {
        setPopup("");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [popup]);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLink, setResetLink] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setPopup("");
    setLoading(true);

    try {
      // Clear old login data
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("loginUserId");

      const res = await API.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      localStorage.setItem("loginUserId", res.data.userId);

      navigate("/verify-login", { replace: true });
    } catch (err) {
      setPopup(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  // SEND RESET LINK
  const sendResetLink = async () => {
    try {
      setResetMessage("");
      setResetLink("");

      const res = await API.post("/auth/forgot-password", {
        email: resetEmail,
      });

      setResetMessage(res.data.message || "Reset link generated.");

      if (res.data.resetLink) {
        setResetLink(res.data.resetLink);
      }
    } catch (err) {
      setResetMessage(
        err.response?.data?.message || "Failed to generate reset link.",
      );
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="mb-3 text-center">Hey User! 👤 Login Here :</h3>

      {/* Popup Message */}
      {popup && <div className="alert alert-danger text-center">{popup}</div>}

      <form onSubmit={handleLogin}>
        <b>Please Enter Your Email :</b>

        <input
          className="form-control mb-2 mt-2"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          required
          onChange={handleChange}
        />

        <b>Please type Your Password :</b>

        <input
          className="form-control mb-2 mt-2"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          required
          onChange={handleChange}
        />

        {/* Forgot Password */}
        <div className="text-end mb-2">
          <span
            style={{
              cursor: "pointer",
              color: "blue",
              fontSize: "14px",
            }}
            onClick={() => setShowForgot(true)}
          >
            Forgot Password?
          </span>
        </div>

        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Checking..." : "Login"}
        </button>
      </form>

      <p className="text-center mt-3">
        New user 👤?{" "}
        <Link to="/signup" className="fw-bold text-decoration-none">
          Create an account 👉
        </Link>
      </p>

      {/* Forgot Password Popup */}
      {showForgot && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5 className="mb-3">Reset Password</h5>

              <input
                type="email"
                className="form-control"
                placeholder="Enter your Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />

              {resetMessage && (
                <div className="alert alert-info mt-2">{resetMessage}</div>
              )}

              {resetLink && (
                <div className="alert alert-success mt-2">
                  Reset Link: <br />
                  <a
                    href={resetLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ wordBreak: "break-all" }}
                  >
                    {resetLink}
                  </a>
                </div>
              )}

              <div className="d-flex gap-2 mt-3">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={sendResetLink}
                >
                  Send Reset Link
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setShowForgot(false);
                    setResetEmail("");
                    setResetMessage("");
                    setResetLink("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
