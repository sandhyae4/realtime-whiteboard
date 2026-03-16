import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetRoomsQuery, useCreateRoomMutation,
  useDeleteRoomMutation, useGetTopRoomsQuery,
} from "../api/whiteboardApi";
import { logout } from "../app/store";
import { disconnectSocket } from "../sockets/socket";
import "../styles/main.css";

function CreateRoomModal({ onClose }) {
  const [createRoom, { isLoading }] = useCreateRoomMutation();
  const [form, setForm] = useState({ name: "", isPublic: false });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createRoom(form);
    if (res.error) { setError(res.error.data?.message || "Failed to create room"); return; }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Room</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Room Name</label>
            <input autoFocus value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Design Sprint, Math Class..." required />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <input type="checkbox" id="pub" checked={form.isPublic} onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))} style={{ width: 18, height: 18, accentColor: "#4f46e5" }} />
            <label htmlFor="pub" style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", cursor: "pointer" }}>Make this room public</label>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ width: "auto" }} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function JoinRoomModal({ onClose }) {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = useSelector((s) => s.auth.accessToken);

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/rooms/join/" + inviteCode.trim(), {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || "Invalid invite code"); setLoading(false); return; }
      navigate("/room/" + data.room._id);
      onClose();
    } catch { setError("Failed to join room"); setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Join a Room</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleJoin}>
          <div className="form-group">
            <label>Invite Code</label>
            <input autoFocus value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Enter 12-character invite code" required />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ width: "auto" }} disabled={loading}>
              {loading ? "Joining..." : "Join Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { data: roomsData, isLoading } = useGetRoomsQuery();
  const { data: topData } = useGetTopRoomsQuery();
  const [deleteRoom] = useDeleteRoomMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const rooms = roomsData?.rooms || [];
  const topRooms = topData?.rooms || [];

  const handleLogout = () => {
    disconnectSocket();
    dispatch(logout());
    navigate("/login");
  };

  const handleDelete = async (e, roomId) => {
    e.preventDefault(); e.stopPropagation();
    if (window.confirm("Delete this room and all its strokes?")) await deleteRoom(roomId);
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/dashboard" className="navbar-brand">Whiteboard</Link>
        <div className="navbar-right">
          <div className="avatar" title={user?.name}>{user?.name?.[0]?.toUpperCase()}</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>{user?.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      <div className="dashboard">
        <div className="page-header">
          <h2>My Rooms</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setShowJoin(true)}>Join Room</button>
            <button className="btn btn-primary" style={{ width: "auto" }} onClick={() => setShowCreate(true)}>+ New Room</button>
          </div>
        </div>

        {isLoading && <div className="spinner-wrap"><div className="spinner" /></div>}

        {!isLoading && (
          <div className="rooms-grid">
            {rooms.map((room) => (
              <div key={room._id} style={{ position: "relative" }}>
                <Link to={"/room/" + room._id} className="room-card">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#4f46e5,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "white", marginBottom: 14 }}>
                    {room.name[0].toUpperCase()}
                  </div>
                  <h3>{room.name}</h3>
                  <p style={{ marginBottom: 4 }}>
                    {room.strokeCount || 0} strokes
                    {room.isPublic && " · Public"}
                  </p>
                  <div className="room-card-footer">
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(room.lastActivity || room.updatedAt).toLocaleDateString()}</span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {room.activeUsers > 0 && (
                        <span className="badge badge-success">{room.activeUsers} online</span>
                      )}
                      <span className="badge badge-primary">Open</span>
                    </div>
                  </div>
                </Link>
                <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: "4px 10px", color: "#ef4444", borderColor: "#fecaca" }}
                    onClick={(e) => handleDelete(e, room._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            <div className="new-room-card" onClick={() => setShowCreate(true)}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>+</div>
              <strong>New Room</strong>
              <span style={{ fontSize: 13, marginTop: 4 }}>Start drawing together</span>
            </div>
          </div>
        )}

        {!isLoading && rooms.length === 0 && (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>W</div>
            <h3>No rooms yet</h3>
            <p>Create your first whiteboard room to start collaborating!</p>
          </div>
        )}

        {/* Top Active Rooms */}
        {topRooms.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#1e293b" }}>
              Top Active Rooms
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Room", "Owner", "Strokes", "Members", "Active Users", "Last Activity"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topRooms.map((room) => (
                    <tr key={room._id} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer" }} onClick={() => navigate("/room/" + room._id)}>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{room.name}</td>
                      <td style={{ padding: "12px 16px", color: "#64748b" }}>{room.ownerName}</td>
                      <td style={{ padding: "12px 16px" }}>{room.strokeCount}</td>
                      <td style={{ padding: "12px 16px" }}>{room.memberCount}</td>
                      <td style={{ padding: "12px 16px" }}>
                        {room.activeUsers > 0 ? <span className="badge badge-success">{room.activeUsers} online</span> : "0"}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 13 }}>{new Date(room.lastActivity).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
      {showJoin && <JoinRoomModal onClose={() => setShowJoin(false)} />}
    </>
  );
}
