# Admin API Specification

The Admin Panel attempts to connect to `https://synchron.work/api`.
Ensure your backend implements the following endpoints and handles CORS for your client domain.

## Authentication
Every request includes the header:
`X-Admin-Token: <VITE_ADMIN_PASSWORD>`

Your server must validate this header against the secret password stored on the server.

## Endpoints

### 1. Get Users
*   **Method:** `GET`
*   **Path:** `/api/users`
*   **Response:** JSON Array of user objects.
    ```json
    [
      {
        "id": "12345",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "Student",       // "Student", "Teacher", "Prefect"
        "year": "12",
        "status": "Active"       // "Active", "Inactive", "Warning"
      }
    ]
    ```

### 2. Get Statistics
*   **Method:** `GET`
*   **Path:** `/api/stats`
*   **Response:** JSON Object
    ```json
    {
      "totalUsers": 150,
      "systemStatus": "Operational"
    }
    ```

### 3. Delete User
*   **Method:** `DELETE`
*   **Path:** `/api/users/:id`
*   **Response:** JSON Object (Success message)
    ```json
    { "success": true, "message": "User deleted" }
    ```

### 4. Clear Cache
*   **Method:** `POST`
*   **Path:** `/api/cache/clear`
*   **Response:** JSON Object
    ```json
    { "success": true, "message": "Cache cleared" }
    ```

## Example Node.js/Express Implementation

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

app.use(cors()); // Configure origin as needed
app.use(express.json());

// Auth Middleware
const requireAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
};

app.get('/api/users', requireAuth, (req, res) => {
  // Fetch users from database
  res.json(users);
});

app.get('/api/stats', requireAuth, (req, res) => {
  res.json({ totalUsers: users.length, systemStatus: 'Operational' });
});

app.delete('/api/users/:id', requireAuth, (req, res) => {
  // Delete user logic
  res.json({ success: true });
});

app.post('/api/cache/clear', requireAuth, (req, res) => {
  // Clear cache logic
  res.json({ success: true, message: 'Server cache cleared' });
});

app.listen(3000);
```
