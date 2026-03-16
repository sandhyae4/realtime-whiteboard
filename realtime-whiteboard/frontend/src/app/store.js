import { configureStore, createSlice } from "@reduxjs/toolkit";
import { whiteboardApi } from "../api/whiteboardApi";

const saved = (() => {
  try { return JSON.parse(localStorage.getItem("wb_auth") || "null"); } catch { return null; }
})();

const authSlice = createSlice({
  name: "auth",
  initialState: { accessToken: saved?.accessToken || null, user: saved?.user || null },
  reducers: {
    setCredentials: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      localStorage.setItem("wb_auth", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      localStorage.removeItem("wb_auth");
    },
  },
});

// Canvas strokes slice for optimistic updates
const canvasSlice = createSlice({
  name: "canvas",
  initialState: { strokes: [], pendingStrokes: [] },
  reducers: {
    setStrokes: (state, action) => { state.strokes = action.payload; },
    addStroke: (state, action) => { state.strokes.push(action.payload); },
    addPendingStroke: (state, action) => { state.pendingStrokes.push(action.payload); },
    clearPendingStrokes: (state) => { state.pendingStrokes = []; },
    clearCanvas: (state) => { state.strokes = []; state.pendingStrokes = []; },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const { setStrokes, addStroke, addPendingStroke, clearPendingStrokes, clearCanvas } = canvasSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    canvas: canvasSlice.reducer,
    [whiteboardApi.reducerPath]: whiteboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(whiteboardApi.middleware),
});
