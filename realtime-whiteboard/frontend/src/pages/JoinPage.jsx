import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../styles/main.css";

// When someone opens an invite link /join/:inviteCode
export default function JoinPage() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const token = useSelector((s) => s.auth.accessToken);
  const [status, setStatus] = useState("joining");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      // Not logged in — save invite code and redirect to login
      localStorage.setItem("pendingInvite", inviteCode);
      navigate("/login");
      return;
    }

    // Already logged in — join the room directly
    fetch("/api/rooms/join/" + inviteCode, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          navigate("/room/" + data.room._id);
        } else {
          setError(data.message || "Invalid invite link");
          setStatus("error");
        }
      })
      .catch(() => {
        setError("Failed to join room");
        setStatus("error");
      });
  }, [inviteCode, token, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        {status === "joining" && (
          <>
            <div className="spinner" style={{ margin: "0 auto 20px" }} />
            <h2 style={{ color: "#4f46e5", marginBottom: 8 }}>Joining Room...</h2>
            <p style={{ color: "#64748b" }}>Please wait while we connect you.</p>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 12, fontWeight: 800, color: "#ef4444" }}>!</div>
            <h2 style={{ color: "#ef4444", marginBottom: 8 }}>Join Failed</h2>
            <p style={{ color: "#64748b", marginBottom: 24 }}>{error}</p>
            <button className="btn btn-primary" style={{ width: "auto" }} onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
