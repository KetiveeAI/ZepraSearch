# Frontend-Backend Connection Troubleshooting Guide

## Issue: Search Results Not Appearing

The frontend is running but search results are not appearing. This is likely due to the backend server not running or not being accessible.

## Quick Fix Steps

### 1. Start the Simple Backend Server

The main backend has complex dependencies. Use the simplified version for testing:

```bash
# Navigate to backend directory
cd ketiveeserchengin/backend

# Start the simple server
node simple-server.js
```

Or on Windows, double-click: `start-simple-server.bat`

### 2. Verify Backend is Running

The backend should show:
```
🚀 Simple backend server running on port 6329
📊 Health check: http://localhost:6329/health
🔍 Search API: http://localhost:6329/api/search?q=javascript
🌐 Frontend should be accessible at: http://localhost:6041
✅ Ready to receive requests from frontend!
```

### 3. Test Backend Connection

Run the test script:
```bash
cd ketiveeserchengin/backend
node test-backend-connection.js
```

### 4. Check Frontend Configuration

The frontend is configured to proxy API calls to `http://localhost:6329` via Vite:

```javascript
// vite.config.js
server: {
  port: 6041,
  proxy: {
    '/api': {
      target: 'http://localhost:6329',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

## Detailed Troubleshooting

### Step 1: Check if Backend is Running

1. Open a new terminal/command prompt
2. Navigate to the backend directory:
   ```bash
   cd ketiveeserchengin/backend
   ```
3. Start the simple server:
   ```bash
   node simple-server.js
   ```

### Step 2: Test Backend Health

1. Open your browser
2. Go to: `http://localhost:6329/health`
3. You should see a JSON response like:
   ```json
   {
     "status": "OK",
     "timestamp": "2024-01-01T12:00:00.000Z",
     "version": "1.0.0-simple",
     "message": "Simple backend server is running"
   }
   ```

### Step 3: Test Search API Directly

1. Go to: `http://localhost:6329/api/search?q=javascript`
2. You should see search results in JSON format

### Step 4: Check Frontend Network Requests

1. Open browser developer tools (F12)
2. Go to Network tab
3. Perform a search on the frontend
4. Look for requests to `/api/search`
5. Check if they're successful (200 status) or failing

### Step 5: Verify Ports

- Frontend: `http://localhost:6041`
- Backend: `http://localhost:6329`
- Vite proxy: `/api` → `http://localhost:6329`

## Common Issues and Solutions

### Issue 1: "Backend connection failed"

**Solution**: Start the backend server
```bash
cd ketiveeserchengin/backend
node simple-server.js
```

### Issue 2: "Connection timeout"

**Solution**: Check if port 6329 is available
```bash
# On Windows
netstat -an | findstr 6329

# On Linux/Mac
netstat -an | grep 6329
```

### Issue 3: "CORS error"

**Solution**: The simple server includes CORS configuration for the frontend ports

### Issue 4: "Module not found"

**Solution**: Install dependencies
```bash
cd ketiveeserchengin/backend
npm install
```

### Issue 5: Frontend shows loading but no results

**Solution**: Check browser console for errors and verify backend is responding

## Testing the Complete Flow

1. **Start Backend**:
   ```bash
   cd ketiveeserchengin/backend
   node simple-server.js
   ```

2. **Start Frontend** (in another terminal):
   ```bash
   cd ketiveeserchengin/frontend
   npm run dev
   ```

3. **Test Search**:
   - Go to `http://localhost:6041`
   - Search for "JavaScript tutorial"
   - Should see results immediately

## Expected Behavior

When working correctly:

1. Frontend loads at `http://localhost:6041`
2. Search box is visible and functional
3. Typing a query and pressing Enter shows results
4. Results include titles, URLs, and snippets
5. Click tracking works (check backend console)
6. Trending and suggestions work

## Mock Data Available

The simple server provides mock results for:
- JavaScript tutorial
- React development
- Python programming
- Machine learning
- Web design

## Next Steps

Once the simple backend is working:

1. Test all search functionality
2. Verify click tracking
3. Check trending queries
4. Test search suggestions
5. Then move to the full backend with real search capabilities

## Support

If issues persist:
1. Check browser console for errors
2. Verify both servers are running
3. Test backend endpoints directly
4. Check network connectivity
5. Ensure no firewall blocking ports 