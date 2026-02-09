const ADMIN_API_URL = 'https://synchron.work/api';

const getHeaders = () => {
    const password = import.meta.env.VITE_ADMIN_PASSWORD;
    return {
        'Content-Type': 'application/json',
        'X-Admin-Token': password // Sending the password as a simple auth token
    };
};

export const fetchAdminStats = async () => {
    try {
        const response = await fetch(`${ADMIN_API_URL}/stats`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return await response.json();
    } catch (error) {
        console.error("Admin API Error:", error);
        throw error;
    }
};

export const fetchUsers = async () => {
    try {
        const response = await fetch(`${ADMIN_API_URL}/users`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return await response.json();
    } catch (error) {
        console.error("Admin API Error:", error);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await fetch(`${ADMIN_API_URL}/users/${userId}`, {
             method: 'DELETE',
             headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete user');
        return await response.json();
    } catch (error) {
        console.error("Admin API Error:", error);
        throw error;
    }
};

export const clearServerCache = async () => {
    try {
        const response = await fetch(`${ADMIN_API_URL}/cache/clear`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to clear server cache');
        return await response.json();
    } catch (error) {
        console.error("Admin API Error:", error);
        throw error;
    }
};
