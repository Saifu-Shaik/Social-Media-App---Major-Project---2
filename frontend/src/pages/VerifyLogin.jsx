import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function VerifyLogin() {
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
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("loginUserId") : null;

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
    }
  }, [userId, navigate]);

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setPopup("OTP must be exactly 6 digits");
      return;
    }

    try {
      setLoading(true);
      setPopup("");

      const res = await API.post("/auth/verify-login", {
        userId,
        token: otp,
      });

      localStorage.setItem("token", res.data.token);

      window.dispatchEvent(new Event("auth-change"));

      localStorage.removeItem("loginUserId");

      navigate("/home", { replace: true });
    } catch (err) {
      setPopup(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 text-center" style={{ maxWidth: "400px" }}>
      <h4 className="mb-3">Go With! Login Verification Here 🔒</h4>
      👉👉👉👉👉
      <br />
      <br />
      <b>Please Enter Your OTP From Google Authenticator App: 🙍🏻‍♂️</b>
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
      {popup && <div className="alert alert-danger mt-3">{popup}</div>}
    </div>
  );
}
