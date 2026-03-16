import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setStrokes, addStroke, clearCanvas } from "../app/store";
import { useCanvas } from "../hooks/useCanvas";
import { getSocket } from "../sockets/socket";
import Toolbar from "./Toolbar";
import ErrorBoundary from "./ErrorBoundary";
import "../styles/main.css";

export default function Canvas({ roomId, roomName, onlineUsers }) {
  const dispatch = useDispatch();
  const strokes = useSelector((s) => s.canvas.strokes);

  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: "" });
  const containerRef = useRef(null);

  const { canvasRef, startDrawing, draw, stopDrawing } = useCanvas(roomId, tool, color, brushSize);

  // Resize canvas to fill container
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Listen to socket events from other users
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Load existing strokes when joining
    socket.on("strokes:init", ({ strokes: existing }) => {
      dispatch(setStrokes(existing));
    });

    // New stroke from another user — optimistic RTK rendering
    socket.on("stroke:new", ({ stroke }) => {
      dispatch(addStroke(stroke));
    });

    // Canvas cleared by owner
    socket.on("canvas:cleared", () => {
      dispatch(clearCanvas());
    });

    return () => {
      socket.off("strokes:init");
      socket.off("stroke:new");
      socket.off("canvas:cleared");
    };
  }, [dispatch]);

  // Handle text tool click
  const handleCanvasClick = (e) => {
    if (tool !== "text") return;
    const rect = canvasRef.current.getBoundingClientRect();
    setTextInput({ visible: true, x: e.clientX - rect.left, y: e.clientY - rect.top, value: "" });
  };

  const handleTextSubmit = (e) => {
    if (e.key !== "Enter" || !textInput.value.trim()) return;
    const stroke = {
      strokeId: Math.random().toString(36).slice(2),
      tool: "text",
      color,
      width: brushSize,
      text: textInput.value,
      x: textInput.x,
      y: textInput.y,
      points: [{ x: textInput.x, y: textInput.y }],
    };
    dispatch(addStroke(stroke));
    const socket = getSocket();
    if (socket) socket.emit("stroke:draw", { roomId, stroke });
    setTextInput({ visible: false, x: 0, y: 0, value: "" });
  };

  const handleClear = () => {
    if (!window.confirm("Clear the entire canvas?")) return;
    dispatch(clearCanvas());
    const socket = getSocket();
    if (socket) socket.emit("canvas:clear", { roomId });
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    dispatch(setStrokes(strokes.slice(0, -1)));
  };

  // Emit cursor position
  const handleMouseMove = (e) => {
    const socket = getSocket();
    if (!socket) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    socket.emit("cursor:move", { roomId, x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (tool !== "text") draw(e);
  };

  return (
    <ErrorBoundary>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Toolbar
          tool={tool} setTool={setTool}
          color={color} setColor={setColor}
          brushSize={brushSize} setBrushSize={setBrushSize}
          onClear={handleClear}
          onUndo={handleUndo}
        />

        <div className="canvas-wrap" ref={containerRef}>
          <canvas
            ref={canvasRef}
            onMouseDown={tool === "text" ? handleCanvasClick : startDrawing}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ cursor: tool === "eraser" ? "cell" : tool === "text" ? "text" : "crosshair" }}
          />

          {/* Text input overlay */}
          {textInput.visible && (
            <input
              autoFocus
              value={textInput.value}
              onChange={(e) => setTextInput((t) => ({ ...t, value: e.target.value }))}
              onKeyDown={handleTextSubmit}
              onBlur={() => setTextInput({ visible: false, x: 0, y: 0, value: "" })}
              style={{
                position: "absolute",
                left: textInput.x,
                top: textInput.y - 20,
                background: "transparent",
                border: "1.5px dashed #4f46e5",
                outline: "none",
                fontSize: brushSize * 6 + "px",
                color,
                fontFamily: "Segoe UI, sans-serif",
                minWidth: 100,
                padding: "2px 4px",
              }}
              placeholder="Type + Enter"
            />
          )}

          {/* Online presence indicator */}
          <div className="presence-bar">
            <div className="presence-dot" />
            <span>{onlineUsers?.length || 1} online</span>
            {onlineUsers?.slice(0, 3).map((u) => (
              <div key={u.userId} style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white" }} title={u.name}>
                {u.name?.[0]?.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
