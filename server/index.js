const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Database
let users = [
    { id: "430000001", name: "Ali Abbas", year: "12", email: "430000001@student.sbhs.nsw.edu.au", status: "Active", role: "Student" },
    { id: "430000002", name: "John Smith", year: "11", email: "430000002@student.sbhs.nsw.edu.au", status: "Active", role: "Student" },
    { id: "430000003", name: "David Chen", year: "10", email: "430000003@student.sbhs.nsw.edu.au", status: "Warning", role: "Student" },
    { id: "430000004", name: "Michael Park", year: "12", email: "430000004@student.sbhs.nsw.edu.au", status: "Active", role: "Prefect" },
    { id: "430000005", name: "Sarah Jones", year: "Staff", email: "s.jones@sbhs.nsw.edu.au", status: "Active", role: "Teacher" },
    { id: "430000006", name: "James Wilson", year: "9", email: "430000006@student.sbhs.nsw.edu.au", status: "Inactive", role: "Student" },
];

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
