import { useState } from "react";
import API from "../../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
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
     SIGNUP (STEP 1 - OTP / QR)
  ========================= */
  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      // ✅ CLEAR OLD AUTH STATE
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("signupUserId");
      localStorage.removeItem("signupQr");

      const res = await API.post("/auth/register", {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      /*
        Backend returns:
        { userId, qrCode }
      */
      localStorage.setItem("signupUserId", res.data.userId);
      localStorage.setItem("signupQr", res.data.qrCode);

      // ✅ GO TO VERIFY PAGE (NO REFRESH)
      navigate("/verify-signup", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="text-center mb-3"> Hey🙋‍♂️! Create Account</h3>
      <br></br>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSignup}>
        <b>Please Enter A Username :</b>
        <input
          className="form-control mb-2 mt-2"
          name="username"
          placeholder="Username "
          value={form.username}
          onChange={handleChange}
          required
        />
        <b>Enter Your Email id :</b>
        <input
          className="form-control mb-2 mt-2"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <b>Enter Your Password : </b>
        <input
          className="form-control mb-3 mt-2"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button className="btn btn-success w-100" disabled={loading}>
          {loading ? "Creating account..." : "Signup & Verify"}
        </button>
      </form>

      <p className="text-center mt-3">
        Already a user 👤?{" "}
        <Link to="/login" className="fw-bold text-decoration-none">
          Login here 👉
        </Link>
      </p>
    </div>
  );
}
