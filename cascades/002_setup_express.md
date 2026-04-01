Create the base Express server for the EACEA Evaluator app.

Create `server/index.js` with:
1. Import express and path
2. Create Express app on port 3000 (or process.env.PORT)
3. Serve static files from `public/` directory
4. Add JSON body parser middleware with 10mb limit
5. Add CORS middleware
6. Mount the project routes at `/api/project` (import from `./routes/project.js`)
7. Create a catch-all route that serves `public/index.html` for SPA-like behavior
8. Start server and log "EACEA Evaluator running on port XXXX"

Create `server/routes/project.js` with:
1. Export an Express Router
2. Add placeholder routes (just return 200 with a message) for:
   - GET /current
   - POST /current
   - POST /version
   - GET /versions
   - GET /version/:id
   - GET /export/json

Test: Start the server with `node server/index.js` and verify it starts without errors. Then stop it.

Commit: "002: Setup Express server with route stubs"
