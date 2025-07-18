const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors({
    origin: ['http://localhost:6329', 'http://localhost:3000'],
    credentials: true
}));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Ketivee Search Frontend',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Ketivee Search Frontend running on http://localhost:${PORT}`);
    console.log(`🔗 Backend API: http://localhost:6329`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
}); 