# Real-time Collaborative Whiteboard

A multi-user whiteboard where strokes appear live on every connected client.

## Run

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open: **http://localhost:5173**

## Features

| Feature | Location |
|---------|----------|
| Socket.IO rooms + presence | `sockets/whiteboardSocket.js` |
| JWT access + httpOnly refresh rotation | `middleware/authMiddleware.js` |
| Email verification | `utils/mailer.js` |
| Stroke batch worker (flush every 3s) | `workers/strokeBatchWorker.js` |
| Aggregation: top-N active rooms | `repositories/roomRepository.js` |
| Zod validation all REST + WS | `validation/schemas.js` |
| GET /health + readiness probe | `routes/healthRoutes.js` |
| React Error Boundary on canvas | `components/ErrorBoundary.jsx` |
| RTK Query + optimistic strokes | `api/whiteboardApi.js` |
| Pino structured logging + request IDs | `app.js` |
| Rate limiting auth + room-create | `middleware/rateLimiter.js` |
| Controller → Service → Repository | All layers separated |
| Invite link — opens same canvas | `/join/:inviteCode` |

## Real-time Invite Flow

1. Open a room → click **Invite**
2. Copy the invite link or send by email
3. Another user opens the link in any browser
4. They join the same room and see the same canvas live

## Credentials

MongoDB Atlas is pre-configured in `backend/.env`.
Email verification requires Gmail app password in `.env`.
