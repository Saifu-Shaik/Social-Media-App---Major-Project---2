import { useState } from "react";
import API from "../../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     HANDLE INPUT
  ========================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
     LOGIN (STEP 1 - OTP)
  ========================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      // ✅ CLEAR OLD SESSION COMPLETELY
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("loginUserId");

      const res = await API.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      /*
        Backend returns:
        { userId, message: "OTP required" }
      */
      localStorage.setItem("loginUserId", res.data.userId);

      // ✅ GO TO OTP SCREEN (NO REFRESH NEEDED)
      navigate("/verify-login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="mb-3 text-center">Hey User!👤 Login Here :</h3>
      <br></br>

      {error && <div className="alert alert-danger">{error}</div>}

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
          className="form-control mb-3 mt-2"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          required
          onChange={handleChange}
        />

        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Checking..." : "Login"}
        </button>
      </form>

      <p className="text-center mt-3">
        New user👤?{" "}
        <Link to="/signup" className="fw-bold text-decoration-none">
          Create an account 👉
        </Link>
      </p>
    </div>
  );
}
