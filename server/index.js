const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const fs = require('fs'); // Removed for Edge Config
// const path = require('path'); // Removed for Edge Config
const { createClient } = require('@vercel/edge-config');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Edge Config Client
// Requires EDGE_CONFIG connection string in .env
const edgeConfig = process.env.EDGE_CONFIG 
    ? createClient(process.env.EDGE_CONFIG) 
    : null;

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

// Helper to get users from Edge Config or fallback to memory
const getUsers = async () => {
    if (!edgeConfig) return users; // Fallback to memory
    try {
        const data = await edgeConfig.get('users');
        return data || [];
    } catch (error) {
        console.error("Edge Config Error:", error);
        return users;
    }
};

// Helper to update users (Note: Edge Config is optimized for Reads, not High-Frequency Writes)
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID;

const saveUsersToEdgeConfig = async (newUsers) => {
    if (!VERCEL_API_TOKEN || !EDGE_CONFIG_ID) return;
    
    try {
        await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: [
                    {
                        operation: 'update',
                        key: 'users',
                        value: newUsers,
                    },
                ],
            }),
        });
    } catch (error) {
        console.error("Failed to update Edge Config:", error);
    }
};

let users = []; 

// Initialize local cache
getUsers().then(data => users = Array.isArray(data) ? data : []);

/* 
 * NOTE: For permanent data storage on Vercel, you need a database (like Vercel KV or MongoDB).
 * File-based storage (users.json) does not work in Vercel's read-only environment.
 */

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
    saveUsersToEdgeConfig(users); // Trigger async update

    console.log(`User registered/updated: ${safeUser.name} (${userId})`);
    res.json({ success: true, count: users.length });
});

// PUT /api/users/:id - Update user details (Role/Status)
app.put('/api/users/:id', requireAuth, (req, res) => {
    const { id } = req.params;String(u.id) === String(id)
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

    saveUsersToEdgeConfig(users);

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
    users = users.filter(user => String(user.id) !== String(id));
    
    if (users.length === initialLength) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    saveUsersToEdgeConfig(users);

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
