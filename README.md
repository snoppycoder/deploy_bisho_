# MFINAC Frontend with Backend Integration

This project consists of a Next.js frontend and an Express backend, connected through a custom server.js file.

## Project Structure

```
mfinac-frontend/
├── app/                    # Next.js frontend (App Router)
├── bisho_backend/         # Express backend
├── server.js              # Custom server that connects frontend and backend
├── package.json           # Frontend dependencies
└── README.md             # This file
```

## How to Run

### Option 1: Use the Custom Server (Recommended)
The `server.js` file acts as a bridge between the frontend and backend:

1. **Start the Backend:**
   ```bash
   cd bisho_backend
   npm run build
   npm start
   ```
   This starts the backend on port 3000.

2. **Start the Frontend with Server:**
   ```bash
   npm run server
   ```
   This starts the frontend on port 3001 with API proxying to the backend.

### Option 2: Run Separately
1. **Backend:** `cd bisho_backend && npm start` (port 3000)
2. **Frontend:** `npm run dev` (port 3000, but with Next.js proxy)

## API Integration

- Frontend makes requests to `/api/*`
- `server.js` proxies these requests to `http://localhost:3000/api/*`
- Backend handles all API logic and database operations

## Dashboard

The dashboard is located at `/dashboard` and fetches data from `/api/dashboard`.

## Troubleshooting

1. **Backend not responding:** Make sure the backend is running on port 3000
2. **Database issues:** Check if PostgreSQL is running and the database is properly configured
3. **CORS errors:** The server.js handles CORS automatically
4. **React hydration warnings:** These are usually from browser extensions and are harmless
5. **Dashboard not loading:** Check if the backend dashboard endpoint is working

## Testing the Connection

You can test if the integration is working by visiting:
- Frontend: http://localhost:3001
- Test API: http://localhost:3001/api/test
- Dashboard: http://localhost:3001/dashboard

## Environment Variables

- `BACKEND_URL`: Backend server URL (default: http://localhost:3000)
- `PORT`: Server port (default: 3001)
- `DATABASE_URL`: PostgreSQL connection string 