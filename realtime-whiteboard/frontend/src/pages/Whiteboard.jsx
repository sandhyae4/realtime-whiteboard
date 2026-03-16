import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetRoomQuery, useGetInviteLinkQuery, useSendInviteMutation } from "../api/whiteboardApi";
import { getSocket } from "../sockets/socket";
import Canvas from "../components/Canvas";
import "../styles/main.css";

function InviteModal({ room, onClose }) {
  const { data } = useGetInviteLinkQuery(room._id);
  const [sendInvite, { isLoading }] = useSendInviteMutation();
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const inviteLink = data?.link || (window.location.origin + "/join/" + room.inviteCode);
  const inviteCode = room.inviteCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError("");
    const res = await sendInvite({ roomId: room._id, email });
    if (res.error) { setError(res.error.data?.message || "Failed to send"); return; }
    setSent(true);
    setEmail("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Invite to "{room.name}"</h3>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>
            Invite Link
          </label>
          <div className="invite-link-box">{inviteLink}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary btn-sm" style={{ width: "auto" }} onClick={handleCopy}>
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleCopyCode}>
              Copy Code: {inviteCode}
            </button>
          </div>
        </div>

        <div style={{ height: 1, background: "#e2e8f0", margin: "20px 0" }} />

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>
            Send Email Invite
          </label>
          {sent && <div className="alert alert-success">Invite sent!</div>}
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSendEmail} style={{ display: "flex", gap: 8 }}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@email.com" required
              style={{ flex: 1, padding: "9px 14px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none" }} />
            <button type="submit" className="btn btn-accent btn-sm" disabled={isLoading} style={{ whiteSpace: "nowrap" }}>
              {isLoading ? "..." : "Send"}
            </button>
          </form>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Whiteboard() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const accessToken = useSelector((s) => s.auth.accessToken);
  const { data, isLoading, isError } = useGetRoomQuery(roomId);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showInvite, setShowInvite] = useState(false);

  // Join socket room
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !roomId) return;

    socket.emit("room:join", { roomId });

    socket.on("presence:update", ({ roomId: rid, users }) => {
      if (rid === roomId) setOnlineUsers(users);
    });

    return () => {
      socket.emit("room:leave", { roomId });
      socket.off("presence:update");
    };
  }, [roomId]);

  if (isLoading) return (
    <div className="whiteboard-page">
      <div className="spinner-wrap" style={{ height: "100vh" }}>
        <div className="spinner" />
      </div>
    </div>
  );

  if (isError) return (
    <div className="whiteboard-page">
      <nav className="navbar">
        <Link to="/dashboard" className="navbar-brand">Whiteboard</Link>
      </nav>
      <div style={{ padding: 48, textAlign: "center" }}>
        <div className="alert alert-error" style={{ maxWidth: 400, margin: "0 auto" }}>
          Room not found or access denied.
        </div>
        <button className="btn btn-primary" style={{ marginTop: 20, width: "auto" }} onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  const room = data?.room;

  return (
    <div className="whiteboard-page">
      {/* Header */}
      <div className="whiteboard-header">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link to="/dashboard" style={{ color: "#4f46e5", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
            Dashboard
          </Link>
          <span style={{ color: "#cbd5e1" }}>/</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{room?.name}</span>
          {room?.isPublic && <span className="badge badge-success">Public</span>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Online users */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>
              {onlineUsers.length || 1} online
            </span>
            {onlineUsers.slice(0, 4).map((u) => (
              <div key={u.userId}
                style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white" }}
                title={u.name}
              >
                {u.name?.[0]?.toUpperCase()}
              </div>
            ))}
          </div>

          <button className="btn btn-accent btn-sm" onClick={() => setShowInvite(true)}>
            Invite
          </button>

          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}
            title={user?.name}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div className="whiteboard-body">
        {room && (
          <Canvas
            roomId={roomId}
            roomName={room.name}
            onlineUsers={onlineUsers}
          />
        )}
      </div>

      {showInvite && room && (
        <InviteModal room={room} onClose={() => setShowInvite(false)} />
      )}
    </div>
  );
}
