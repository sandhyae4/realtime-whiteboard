import "../styles/main.css";

const TOOLS = [
  { id: "pen", icon: "✏️", label: "Pen" },
  { id: "eraser", icon: "🧹", label: "Eraser" },
  { id: "line", icon: "╱", label: "Line" },
  { id: "rect", icon: "▭", label: "Rectangle" },
  { id: "circle", icon: "○", label: "Circle" },
  { id: "text", icon: "T", label: "Text" },
];

const COLORS = ["#000000", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#ffffff"];
const SIZES = [2, 4, 8, 14, 20];

export default function Toolbar({ tool, setTool, color, setColor, brushSize, setBrushSize, onClear, onUndo }) {
  return (
    <div className="toolbar">
      {/* Tools */}
      {TOOLS.map((t) => (
        <button
          key={t.id}
          className={"tool-btn" + (tool === t.id ? " active" : "")}
          onClick={() => setTool(t.id)}
          title={t.label}
        >
          <span>{t.icon}</span>
        </button>
      ))}

      <div className="tool-separator" />

      {/* Colors */}
      {COLORS.map((c) => (
        <div
          key={c}
          className={"color-swatch" + (color === c ? " active" : "")}
          style={{ background: c, border: c === "#ffffff" ? "2px solid #e2e8f0" : "2px solid white" }}
          onClick={() => setColor(c)}
          title={c}
        />
      ))}

      <div className="tool-separator" />

      {/* Brush sizes */}
      {SIZES.map((s) => (
        <button
          key={s}
          className={"tool-btn" + (brushSize === s ? " active" : "")}
          onClick={() => setBrushSize(s)}
          title={"Size " + s}
          style={{ fontSize: 10, fontWeight: 700 }}
        >
          <span style={{ width: s, height: s, borderRadius: "50%", background: brushSize === s ? "white" : "#4f46e5", display: "block" }} />
        </button>
      ))}

      <div className="tool-separator" />

      <button className="tool-btn" onClick={onUndo} title="Undo">
        <span style={{ fontSize: 16 }}>↩</span>
      </button>

      <button className="tool-btn" onClick={onClear} title="Clear canvas" style={{ color: "#ef4444" }}>
        <span style={{ fontSize: 16 }}>🗑</span>
      </button>
    </div>
  );
}
