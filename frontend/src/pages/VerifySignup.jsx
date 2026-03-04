import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function VerifySignup() {
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
  const [userId, setUserId] = useState(null);
  const [qrCode, setQrCode] = useState(null);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUserId = localStorage.getItem("signupUserId");
    const storedQr = localStorage.getItem("signupQr");

    if (!storedUserId || !storedQr) {
      setPopup("Invalid or expired signup session");
      return;
    }

    setUserId(storedUserId);
    setQrCode(storedQr);
  }, []);

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setPopup("OTP must be 6 digits");
      return;
    }

    try {
      setLoading(true);
      setPopup("");

      await API.post("/auth/verify-signup", {
        userId,
        token: otp,
      });

      localStorage.removeItem("signupUserId");
      localStorage.removeItem("signupQr");

      setPopup("Signup verified successfully. Please login.");

      navigate("/login", { replace: true });
    } catch (err) {
      setPopup(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  if (!qrCode && popup) {
    return (
      <div className="container mt-5 text-center text-danger">
        <h5>{popup}</h5>

        <button
          className="btn btn-link"
          onClick={() => navigate("/signup", { replace: true })}
        >
          Go back to Signup
        </button>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="container mt-5 text-center">
        <h5>Loading verification...</h5>
      </div>
    );
  }

  return (
    <div className="container mt-5 text-center" style={{ maxWidth: "420px" }}>
      <div className="card p-4">
        <h4 className="mb-2">Verify Your Account</h4>

        <p className="text-muted">
          Scan this QR code using <b>Google Authenticator</b>
        </p>

        <div className="mb-3">
          <img src={qrCode} alt="QR Code" />
        </div>

        <input
          className="form-control mb-2"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          maxLength={6}
        />

        <button
          className="btn btn-primary w-100"
          onClick={verifyOtp}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {popup && <div className="alert alert-danger mt-3">{popup}</div>}
      </div>
    </div>
  );
}
