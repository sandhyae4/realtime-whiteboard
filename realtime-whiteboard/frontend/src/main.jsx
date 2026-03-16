import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";
import "./styles/main.css";

// Reconnect socket on page refresh if already logged in
import { connectSocket } from "./sockets/socket";
const saved = (() => {
  try { return JSON.parse(localStorage.getItem("wb_auth") || "null"); } catch { return null; }
})();
if (saved?.accessToken) connectSocket(saved.accessToken);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
