import { useEffect, useState } from "react";

export default function GlobalLoader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false); // ⏱ hide after 1 second
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#ffffff", // full white so nothing behind is visible
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div className="text-center">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{
            width: "5rem",
            height: "5rem",
            borderWidth: "0.45rem",
          }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>

        <div
          style={{
            marginTop: "16px",
            fontWeight: "600",
            color: "#0d6efd",
            fontSize: "16px",
          }}
        >
          Loading...
        </div>
      </div>
    </div>
  );
}
