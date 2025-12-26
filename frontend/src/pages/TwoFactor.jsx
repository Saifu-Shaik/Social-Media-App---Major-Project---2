import { useEffect, useState } from "react";
import API from "../api/api";

export default function TwoFactor() {
  const [qr, setQr] = useState("");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    API.get("/2fa/enable").then((res) => {
      setQr(res.data.qrCode);
    });
  }, []);

  const verify = async () => {
    try {
      await API.post("/2fa/verify", { token: otp });
      setMsg("2FA Enabled Successfully");
    } catch {
      setMsg("Invalid OTP");
    }
  };

  return (
    <div className="container mt-5 text-center">
      <h4>Authenticator Verification</h4>

      {qr && <img src={qr} alt="QR Code" />}

      <input
        className="form-control mt-3"
        placeholder="Enter 6-digit code"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <button className="btn btn-success mt-2" onClick={verify}>
        Verify
      </button>

      {msg && <p className="mt-2">{msg}</p>}
    </div>
  );
}
