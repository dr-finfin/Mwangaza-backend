# Mwangaza Backend

Node.js + Express + TypeScript backend for the Mwangaza learning platform.

## 🚀 Tech Stack
- Node.js
- Express
- TypeScript
- PostgreSQL (Supabase)
- JWT Authentication

---

## 📦 Installation

Clone the repo:

git clone <your-backend-repo-url>

Install dependencies:

npm install

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

---

## 🧪 Run Locally

Build:

npm run build

Start:

npm start

Server runs on:

http://localhost:5000

---

## 🗄 Database

Uses Supabase PostgreSQL.

Tables are auto-created on startup:
- users
- progress

---

## 🌍 Deployment

Deployed on Render.

Environment variables must be set in the Render dashboard.

---

## 🔐 Security Notes

- Never commit `.env` files
- Always rotate database passwords if exposed
- Use strong JWT secrets in production