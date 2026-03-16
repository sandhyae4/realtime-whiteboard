import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const LazyLogin = lazy(() => import("./pages/Login"));
const LazyDashboard = lazy(() => import("./pages/Dashboard"));
const LazyWhiteboard = lazy(() => import("./pages/Whiteboard"));
const LazyJoinPage = lazy(() => import("./pages/JoinPage"));
const LazyVerifyEmail = lazy(() => import("./pages/VerifyEmail"));

function Loading() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ width: 44, height: 44, border: "4px solid #e0e7ff", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function PrivateRoute({ children }) {
  const token = useSelector((s) => s.auth.accessToken);
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LazyLogin />} />
          <Route path="/verify-email" element={<LazyVerifyEmail />} />
          <Route path="/join/:inviteCode" element={<LazyJoinPage />} />
          <Route path="/dashboard" element={<PrivateRoute><LazyDashboard /></PrivateRoute>} />
          <Route path="/room/:roomId" element={<PrivateRoute><LazyWhiteboard /></PrivateRoute>} />
          <Route path="*" element={
            <div style={{ textAlign: "center", padding: 80 }}>
              <div style={{ fontSize: 64, fontWeight: 800, color: "#4f46e5" }}>404</div>
              <h2 style={{ marginBottom: 16, color: "#1e293b" }}>Page Not Found</h2>
              <a href="/dashboard" style={{ display: "inline-flex", padding: "11px 28px", background: "#4f46e5", color: "white", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
                Go Home
              </a>
            </div>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
