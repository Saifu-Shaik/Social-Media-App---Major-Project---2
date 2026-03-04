import { useState, useEffect } from "react";
import API from "../../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
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
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;

    setPopup("");
    setLoading(true);

    try {
      // Clear old data
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("signupUserId");
      localStorage.removeItem("signupQr");

      const res = await API.post("/auth/register", {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      // Save verification data
      localStorage.setItem("signupUserId", res.data.userId);
      localStorage.setItem("signupQr", res.data.qrCode);

      navigate("/verify-signup", { replace: true });
    } catch (err) {
      setPopup(
        err.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="text-center mb-3">Hey 🙋‍♂️! Create Account</h3>

      {/* Popup Message */}
      {popup && <div className="alert alert-danger text-center">{popup}</div>}

      <form onSubmit={handleSignup}>
        <b>Please Enter A Username :</b>

        <input
          className="form-control mb-2 mt-2"
          name="username"
          placeholder="Username"
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

        <b>Enter Your Password :</b>

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
