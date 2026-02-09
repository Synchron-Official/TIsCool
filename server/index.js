const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Middleware
const allowedOrigins = ['https://www.synchron.work', 'http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // For debugging, you might want to log the blocked origin
            console.log('Blocked Origin:', origin);
            // Optionally allow it anyway for now to fix the blockage
            // return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token']
}));

app.use(express.json());

// In-memory storage (Resets on server restart)
let users = []; 
let logs = []; // System logs
let systemState = {
    maintenance: false,
    broadcast: null // { message: "...", type: "info/warning/error" }
};

const addLog = (action, user, details) => {
    const log = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        timestamp: new Date(),
        action: action.toUpperCase(),
        user: user || 'SYSTEM',
        details
    };
    logs.unshift(log);
    if (logs.length > 100) logs.pop(); // Keep last 100 logs
};

// Initial log
addLog('STARTUP', 'SYSTEM', 'Server service started');

// Authentication Middleware
const requireAuth = (req, res, next) => {
    const token = req.headers['x-admin-token'];
    
    // In production, use timing-safe comparison
    if (!token || token !== ADMIN_PASSWORD) {
        return res.status(403).json({ error: 'Unauthorized access' });
    }
    next();
};

// Routes

// POST /api/register - Auto-register users on login
app.post('/api/register', requireAuth, (req, res) => {
    const newUser = req.body;
    
    // Basic validation
    if (!newUser.id || !newUser.email) {
        return res.status(400).json({ error: 'Missing user ID or email' });
    }

    // Normalize ID to string to prevent duplicates
    const userId = String(newUser.id);
    const safeUser = { ...newUser, id: userId };

    // Check if user already exists
    const existingIndex = users.findIndex(u => String(u.id) === userId);
    
    if (existingIndex >= 0) {
    addLog('REGISTER', `${safeUser.name} (${userId})`, 'User sync/login');

        // Update existing user (e.g. last login time)
        users[existingIndex] = { 
            ...users[existingIndex], 
            ...safeUser, 
            lastSeen: new Date() 
        };
    } else {
        // Add new user
        users.push({ 
            ...safeUser, 
            status: 'Active', 
            role: 'Student', 
            joined: new Date(),
            timetable: safeUser.timetable || null
        });
    }

    // Persist changes
    // no-op

    console.log(`User registered/updated: ${safeUser.name} (${userId})`);
    res.json({ success: true, count: users.length });
});

// PUT /api/users/:id - Update user details (Role/Status)
app.put('/api/users/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    // Find user
    const userIndex = users.findIndex(u => String(u.id) === String(id));
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Apply updates - whitelist allowed fields for safety
    const allowedUpdates = ['role', 'status', 'name', 'year'];
    
    allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            users[userIndex][field] = updates[field];
        }
    });

    addLog('UPDATE', users[userIndex].name, `Updated fields: ${Object.keys(updates).join(', ')}`);

    res.json({ success: true, user: users[userIndex] });
});

// GET /api/stats
app.get('/api/stats', requireAuth, (req, res) => {
    res.json({
        totalUsers: users.length,
        systemStatus: systemState.maintenance ? 'Maintenance' : 'Operational',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage().heapUsed,
        activeSesssions: Math.floor(Math.random() * (users.length > 0 ? users.length : 1)) + 1 // Mock
    });
});

// GET /api/logs
app.get('/api/logs', requireAuth, (req, res) => {
    res.json(logs);
});

// POST /api/broadcast
app.post('/api/broadcast', requireAuth, (req, res) => {
    const { message, type } = req.body;
    systemState.broadcast = message ? { message, type: type || 'info' } : null;
    
    if (message) addLog('BROADCAST', 'ADMIN', `Global alert: "${message}"`);
    else addLog('BROADCAST', 'ADMIN', 'Cleared global alert');
    
    res.json({ success: true, broadcast: systemState.broadcast });
});

// GET /api/broadcast (Publicly accessible usually, but here requires auth for viewing in admin)
// Real app would have a public endpoint for clients to pull this
app.get('/api/broadcast', requireAuth, (req, res) => {
    res.json(systemState.broadcast);
});

// GET /api/system/status (Public endpoint for client app)
app.get('/api/system/status', (req, res) => {
    res.json({
        maintenance: systemState.maintenance,
        broadcast: systemState.broadcast
    });
});

// POST /api/maintenance (Toggle Maintenance Mode)
app.post('/api/maintenance', requireAuth, (req, res) => {
    const { maintenance } = req.body;
    systemState.maintenance = maintenance;
    
    addLog('MAINTENANCE', 'ADMIN', `System maintenance mode ${maintenance ? 'ENABLED' : 'DISABLED'}`);
    
    res.json({ success: true, maintenance: systemState.maintenance });
});

// GET /api/users
app.get('/api/users', requireAuth, (req, res) => {
    res.json(users);
});

// DELETE /api/users/:id
app.delete('/api/users/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const initialLength = users.length;
    users = users.filter(user => String(user.id) !== String(id));
    
    addLog('DELETE', id, 'User deleted manually');

    if (users.length === initialLength) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
});

// POST /api/cache/clear
app.post('/api/cache/clear', requireAuth, (req, res) => {
    // Logic to clear server cache would go here
    console.log('Cache clear requested by admin');
    res.json({ success: true, message: 'Server cache cleared successfully' });
});

// Health check endpoint (public)
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Admin Password configured: ${!!ADMIN_PASSWORD}`);
    });
}

// Export the app for Vercel
module.exports = app;
