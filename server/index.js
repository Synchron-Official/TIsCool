const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Middleware
app.use(cors());
app.use(express.json());

// Persistent Database (JSON File) for local reliability
const DATA_FILE = path.join(__dirname, 'users.json');

const loadUsers = () => {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error("Error loading users:", err);
    }
    return [];
};

const saveUsers = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error saving users:", err);
    }
};

let users = loadUsers();

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

    // Check if user already exists
    const existingIndex = users.findIndex(u => u.id === newUser.id);
    
    if (existingIndex >= 0) {
        // Update existing user (e.g. last login time)
        users[existingIndex] = { 
            ...users[existingIndex], 
            ...newUser, 
            lastSeen: new Date() 
        };
    } else {
        // Add new user
        users.push({ 
            ...newUser, 
            status: 'Active', 
            role: 'Student', 
            joined: new Date(),
            timetable: newUser.timetable || null
        });
    }

    // Persist changes
    saveUsers(users);

    console.log(`User registered/updated: ${newUser.name} (${newUser.id})`);
    res.json({ success: true, count: users.length });
});

// PUT /api/users/:id - Update user details (Role/Status)
app.put('/api/users/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    // Find user
    const userIndex = users.findIndex(u => u.id === id);
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

    saveUsers(users);

    res.json({ success: true, user: users[userIndex] });
});

// GET /api/stats
app.get('/api/stats', requireAuth, (req, res) => {
    res.json({
        totalUsers: users.length,
        systemStatus: 'Operational',
        uptime: process.uptime()
    });
});

// GET /api/users
app.get('/api/users', requireAuth, (req, res) => {
    res.json(users);
});

// DELETE /api/users/:id
app.delete('/api/users/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const initialLength = users.length;
    users = users.filter(user => user.id !== id);
    
    if (users.length === initialLength) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    saveUsers(users);

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

module.exports = app;
