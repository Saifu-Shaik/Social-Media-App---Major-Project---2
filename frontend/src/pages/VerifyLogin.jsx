import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function VerifyLogin() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("loginUserId");

  /* ================= REDIRECT SAFETY ================= */
  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
    }
  }, [userId, navigate]);

  /* ================= VERIFY OTP ================= */
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setError("OTP must be exactly 6 digits");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/verify-login", {
        userId,
        token: otp,
      });

      /* ✅ SAVE TOKEN */
      localStorage.setItem("token", res.data.token);

      /* 🔥 NOTIFY HEADER (NO REFRESH NEEDED) */
      window.dispatchEvent(new Event("auth-change"));

      /* cleanup */
      localStorage.removeItem("loginUserId");

      /* redirect */
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container mt-5 text-center" style={{ maxWidth: "400px" }}>
      <h4 className="mb-3"> Go With! Login Verification Here 🔒</h4>
      👉👉👉👉👉
      <br></br>
      <br></br>
      <b>Please Enter Your Otp From Google Authenticator App: 🙍🏻‍♂️</b>
      <input
        className="form-control mb-2 mt-3 text-center"
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
        maxLength={6}
      />
      <button
        className="btn btn-success w-100 mt-2"
        onClick={verifyOtp}
        disabled={loading}
      >
        {loading ? "Verifying..." : "Verify & Continue"}
      </button>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
}
