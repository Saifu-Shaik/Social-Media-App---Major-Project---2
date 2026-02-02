import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import VerifySignup from "./pages/VerifySignup";
import VerifyLogin from "./pages/VerifyLogin";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import UserProfile from "./pages/UserProfile";
import Chat from "./pages/Chat";
import GlobalLoader from "./components/GlobalLoader";

function AppRoutes() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null,
  );

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, []);

  if (loading) {
    return <GlobalLoader />;
  }

  return (
    <>
      <Header />

      <Routes>
        <Route path="/home" element={<Home />} />

        <Route
          path="/login"
          element={token ? <Navigate to="/home" replace /> : <Login />}
        />

        <Route
          path="/signup"
          element={token ? <Navigate to="/home" replace /> : <Signup />}
        />

        <Route path="/verify-signup" element={<VerifySignup />} />
        <Route path="/verify-login" element={<VerifyLogin />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/:id"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
