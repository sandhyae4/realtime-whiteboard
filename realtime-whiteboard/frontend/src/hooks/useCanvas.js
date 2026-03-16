import { useRef, useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addStroke, addPendingStroke } from "../app/store";
import { getSocket } from "../sockets/socket";
import { v4 as uuidv4 } from "uuid";

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const useCanvas = (roomId, tool, color, brushSize) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const currentPoints = useRef([]);
  const currentStrokeId = useRef(null);
  const dispatch = useDispatch();
  const strokes = useSelector((s) => s.canvas.strokes);

  // Redraw all strokes on canvas
  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => drawStroke(ctx, stroke));
  }, [strokes]);

  useEffect(() => { redrawAll(); }, [strokes, redrawAll]);

  const drawStroke = (ctx, stroke) => {
    if (!stroke?.points?.length && stroke.tool !== "text") return;
    ctx.save();
    ctx.strokeStyle = stroke.color || "#000";
    ctx.lineWidth = stroke.width || 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (stroke.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = (stroke.width || 3) * 3;
    }

    if (stroke.tool === "pen" || stroke.tool === "eraser") {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    } else if (stroke.tool === "line") {
      const p = stroke.points;
      ctx.beginPath();
      ctx.moveTo(p[0].x, p[0].y);
      ctx.lineTo(p[p.length - 1].x, p[p.length - 1].y);
      ctx.stroke();
    } else if (stroke.tool === "rect") {
      const p = stroke.points;
      ctx.strokeRect(p[0].x, p[0].y, p[p.length - 1].x - p[0].x, p[p.length - 1].y - p[0].y);
    } else if (stroke.tool === "circle") {
      const p = stroke.points;
      const rx = Math.abs(p[p.length - 1].x - p[0].x) / 2;
      const ry = Math.abs(p[p.length - 1].y - p[0].y) / 2;
      const cx = p[0].x + (p[p.length - 1].x - p[0].x) / 2;
      const cy = p[0].y + (p[p.length - 1].y - p[0].y) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (stroke.tool === "text" && stroke.text) {
      ctx.fillStyle = stroke.color || "#000";
      ctx.font = (stroke.width * 6 || 18) + "px Segoe UI, sans-serif";
      ctx.fillText(stroke.text, stroke.x || 0, stroke.y || 0);
    }
    ctx.restore();
  };

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    currentPoints.current = [getPos(e, canvas)];
    currentStrokeId.current = generateId();
  }, []);

  const draw = useCallback((e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);
    currentPoints.current.push(pos);

    // Live preview
    const ctx = canvas.getContext("2d");
    redrawAll();
    const previewStroke = {
      strokeId: currentStrokeId.current,
      tool, color, width: brushSize,
      points: currentPoints.current,
    };
    drawStroke(ctx, previewStroke);
  }, [tool, color, brushSize, redrawAll]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (currentPoints.current.length < 2) { currentPoints.current = []; return; }

    const stroke = {
      strokeId: currentStrokeId.current,
      tool, color, width: brushSize,
      points: [...currentPoints.current],
    };

    // Optimistic update
    dispatch(addStroke(stroke));

    // Emit to server via socket
    const socket = getSocket();
    if (socket) {
      socket.emit("stroke:draw", { roomId, stroke });
    }

    currentPoints.current = [];
  }, [tool, color, brushSize, roomId, dispatch]);

  return { canvasRef, startDrawing, draw, stopDrawing, drawStroke, redrawAll };
};
