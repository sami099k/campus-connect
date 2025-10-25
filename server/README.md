# Campus Connect Server

Express + MongoDB backend for Campus Connect.

## Quick start
1. Create a `.env` file in the project root:

```
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/campus_connect
```

2. Install dependencies

```powershell
npm install
```

3. Start the server (dev)

```powershell
npm run dev
```

You should see:
```
MongoDB connected: campus_connect
Server listening on http://localhost:4000
```

4. Test
- Open http://localhost:4000/ in your browser; you should see "Campus Connect API is running".

## Models
See `models/` for:
- `User`, `Group`, `Membership`, `Post`, `QuickPost`, `Comment`, `Like`, `Notification`.

## SRS
Full SRS at `docs/SRS.md`.
