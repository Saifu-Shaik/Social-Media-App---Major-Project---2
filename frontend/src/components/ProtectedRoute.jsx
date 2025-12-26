import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );

  /* 🔥 Sync token without refresh */
  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, []);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
