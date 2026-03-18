# 🌟 MathKids — Fun Math App for Ages 5–6

A full-stack math practice app for young children with animated UI, multiple operations, progressive stages, star rewards, and an admin dashboard.

---

## ✨ Features

### For Kids
- 🎭 **Avatar selection** — pick a fun animal avatar on sign up
- ➕➖➗ **3 Operations** — Addition, Subtraction, Division
- 🔓 **5 Progressive Stages** per operation (unlocked by scoring 70%+)
- ⏱️ **15-second timer** per question with animated SVG ring
- 🎉 **Flying emoji animations** on correct answers
- 🎊 **Confetti celebration** on results screen
- ⭐ **Star rewards** saved to MongoDB
- 📱 Fully responsive — works on tablets and phones

### For Parents / Admin
- 🛡️ **Admin dashboard** with separate password login
- 👦 **View every child's** sessions, scores, stage progress
- 📊 **Global stats** — total children, sessions, stars, average scores
- 🔍 **Search** children by username
- 📋 **Detailed modal** per child with session history table

---

## 🚀 Quick Start

### Option 1 — Docker (Recommended, one command)

```bash
git clone <repo>
cd mathkids
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017

### Option 2 — Manual

**Prerequisites:** Node.js 18+, MongoDB running locally

**Backend:**
```bash
cd backend
cp .env.example .env       # Edit MONGO_URI, JWT_SECRET, ADMIN_PASSWORD
npm install
npm run dev                # Starts on :5000
```

**Frontend:**
```bash
cd frontend
npm install
npm start                  # Starts on :3000
```

---

## 🔐 Default Credentials

| Role  | Field    | Default     | Change in          |
|-------|----------|-------------|--------------------|
| Admin | Password | `admin123`  | `backend/.env`     |
| Child | Any      | Self-register via app | —          |

> ⚠️ **Change** `JWT_SECRET` and `ADMIN_PASSWORD` before deploying!

---

## 📁 Project Structure

```
mathkids/
├── backend/
│   ├── server.js              # Express entry point
│   ├── .env.example           # Environment template
│   ├── Dockerfile
│   ├── models/
│   │   └── User.js            # User + session + progress schema
│   ├── middleware/
│   │   └── auth.js            # JWT & admin guards
│   └── routes/
│       ├── auth.js            # Register, login, admin-login, /me
│       ├── game.js            # Save session, get progress
│       └── admin.js           # Children list, stats
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf             # SPA routing + API proxy
│   ├── public/index.html
│   └── src/
│       ├── App.js             # Router + protected routes
│       ├── index.css          # Full animated theme (Fredoka + Nunito)
│       ├── contexts/
│       │   └── AuthContext.js # Global auth state + axios instance
│       ├── components/
│       │   └── Navbar.js
│       └── pages/
│           ├── Login.js
│           ├── Register.js
│           ├── Dashboard.js   # Operation + stage selector
│           ├── Play.js        # Core game with timer & animations
│           ├── Results.js     # Score + confetti + stars
│           ├── AdminLogin.js
│           └── Admin.js       # Full admin panel
└── docker-compose.yml
```

---

## 🎮 Game Mechanics

| Stage | Number Range | Questions | Unlock Requirement |
|-------|-------------|-----------|-------------------|
| 1 — Baby Steps 🐣   | 1–5   | 8  | Always unlocked |
| 2 — Getting Good 🌱  | 1–10  | 10 | Score 70%+ on Stage 1 |
| 3 — Super Star ⭐    | 1–20  | 10 | Score 70%+ on Stage 2 |
| 4 — Champion 🏆      | 1–50  | 12 | Score 70%+ on Stage 3 |
| 5 — Math Wizard 🧙   | 1–100 | 12 | Score 70%+ on Stage 4 |

**Stars earned:** 3⭐ for 90%+, 2⭐ for 70%+, 1⭐ for 50%+

**Division** always generates clean (whole number) answers, appropriate for young children.

---

## 🛠 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register child |
| POST | `/api/auth/login` | — | Login child |
| POST | `/api/auth/admin-login` | — | Admin login |
| GET  | `/api/auth/me` | JWT | Get current user |
| POST | `/api/game/session` | JWT | Save game session |
| GET  | `/api/game/progress` | JWT | Get child's progress |
| GET  | `/api/admin/children` | Admin JWT | List all children |
| GET  | `/api/admin/children/:id` | Admin JWT | Child detail |
| GET  | `/api/admin/stats` | Admin JWT | Global stats |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6 |
| Styling | Bootstrap 5, Bootstrap Icons, Custom CSS |
| Fonts | Fredoka One, Nunito (Google Fonts) |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose 8 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| DevOps | Docker, docker-compose, nginx |
