import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../app/store";
import { connectSocket } from "../sockets/socket";
import "../styles/main.css";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setStatus("error"); return; }

    fetch("/api/auth/verify-email?token=" + token)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          dispatch(setCredentials({ accessToken: data.accessToken, user: data.user }));
          connectSocket(data.accessToken);
          setStatus("success");
          // Check for pending invite
          const pendingInvite = localStorage.getItem("pendingInvite");
          if (pendingInvite) {
            localStorage.removeItem("pendingInvite");
            setTimeout(() => navigate("/join/" + pendingInvite), 1500);
          } else {
            setTimeout(() => navigate("/dashboard"), 1500);
          }
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        {status === "verifying" && (
          <>
            <div className="spinner" style={{ margin: "0 auto 20px" }} />
            <p style={{ color: "#64748b" }}>Verifying your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16, color: "#10b981" }}>OK</div>
            <h2 style={{ color: "#10b981", marginBottom: 8 }}>Email Verified!</h2>
            <p style={{ color: "#64748b" }}>Redirecting to dashboard...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16, color: "#ef4444" }}>X</div>
            <h2 style={{ color: "#ef4444", marginBottom: 8 }}>Verification Failed</h2>
            <p style={{ color: "#64748b", marginBottom: 20 }}>The link is invalid or expired.</p>
            <Link to="/login" className="btn btn-primary" style={{ width: "auto", display: "inline-flex" }}>
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
