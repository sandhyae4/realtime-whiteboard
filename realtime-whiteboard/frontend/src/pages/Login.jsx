import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation, useRegisterMutation } from "../api/whiteboardApi";
import { setCredentials } from "../app/store";
import { connectSocket } from "../sockets/socket";
import "../styles/main.css";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginApi, { isLoading: loggingIn }] = useLoginMutation();
  const [registerApi, { isLoading: registering }] = useRegisterMutation();

  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const res = await loginApi({ email: form.email, password: form.password });
    if (res.error) { setError(res.error.data?.message || "Login failed"); return; }
    dispatch(setCredentials({ accessToken: res.data.accessToken, user: res.data.user }));
    connectSocket(res.data.accessToken);
    navigate("/dashboard");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    const res = await registerApi({ name: form.name, email: form.email, password: form.password });
    if (res.error) { setError(res.error.data?.message || "Registration failed"); return; }
    // Auto login after register — no email verification
    dispatch(setCredentials({ accessToken: res.data.accessToken, user: res.data.user }));
    connectSocket(res.data.accessToken);
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Whiteboard</h1>
          <p>Real-time collaborative drawing</p>
        </div>

        <div className="auth-tabs">
          {["login", "register"].map((t) => (
            <button
              key={t}
              className={"auth-tab" + (tab === t ? " active" : "")}
              onClick={() => { setTab(t); setError(""); }}
            >
              {t === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {tab === "login" ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@email.com"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Your password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loggingIn}>
              {loggingIn ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Jane Smith"
                required
                minLength={2}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="jane@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={registering}>
              {registering ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          {tab === "login" ? (
            <>No account?{" "}<button className="text-link" onClick={() => setTab("register")}>Register</button></>
          ) : (
            <>Have an account?{" "}<button className="text-link" onClick={() => setTab("login")}>Sign In</button></>
          )}
        </div>
      </div>
    </div>
  );
}