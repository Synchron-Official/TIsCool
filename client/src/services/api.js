// Environment variables
// Trimming whitespace is crucial as copy-paste often adds invisible breaks
const CLIENT_ID = import.meta.env.VITE_SBHS_CLIENT_ID?.trim();
const CLIENT_SECRET = import.meta.env.VITE_SBHS_CLIENT_SECRET?.trim();
const REDIRECT_URI = import.meta.env.VITE_SBHS_REDIRECT_URI?.trim();

const AUTH_ENDPOINT = 'https://auth.sbhs.net.au/authorize';
const TOKEN_ENDPOINT = 'https://auth.sbhs.net.au/token';
const API_BASE_URL = 'https://student.sbhs.net.au/api';

// Scopes required for the app
const SCOPES = 'all-ro openid profile email';

/**
 * Initiates the OAuth login flow by redirecting the user.
 */
export const performLogin = () => {
  if (!CLIENT_ID || !REDIRECT_URI) {
    console.error("Missing Environment Variables for Auth");
    alert("Configuration Error: Missing Client ID or Redirect URI.");
    return;
  }

  // Generate a random state for security (CSRF protection)
  const state = Math.random().toString(36).substring(7);
  sessionStorage.setItem('sbhs_auth_state', state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state: state
  });

  const authUrl = `${AUTH_ENDPOINT}?${params.toString()}`;
  console.log("Redirecting to Auth:", authUrl); // Debugging aid
  window.location.href = authUrl;
};

/**
 * Exchanges the temporary authorization code for an access token.
 * @param {string} code 
 */
export const exchangeToken = async (code) => {
  const formBody = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI
  });

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    });

    if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Store tokens securely (in memory or localStorage for persistence across refersh)
    // Note: LocalStorage is vulnerable to XSS, but common for simple apps.
    // HTTPOnly cookies are safer but require a backend proxy.
    localStorage.setItem('sbhs_access_token', data.access_token);
    if(data.refresh_token) {
        localStorage.setItem('sbhs_refresh_token', data.refresh_token);
    }
    // Calculate expiry
    const expiry = new Date().getTime() + (data.expires_in * 1000);
    localStorage.setItem('sbhs_token_expiry', expiry);

    return data;
  } catch (error) {
    console.error("Error exchanging token:", error);
    throw error;
  }
};

/**
 * Helper to get the token, or handle expiry (basic implementation)
 */
const getAccessToken = () => {
    return localStorage.getItem('sbhs_access_token');
};

export const logout = () => {
    localStorage.removeItem('sbhs_access_token');
    localStorage.removeItem('sbhs_refresh_token');
    localStorage.removeItem('sbhs_token_expiry');
    window.location.href = '/';
};

export const isAuthenticated = () => {
    const token = getAccessToken();
    const expiry = localStorage.getItem('sbhs_token_expiry');
    return token && expiry && new Date().getTime() < parseInt(expiry);
};

// --- API Calls ---

async function fetchWithAuth(endpoint) {
    const token = getAccessToken();
    if (!token) {
        throw new Error("No access token available");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        // Handle 401 (Unauthorized) - potentially trigger refresh or logout
        if (response.status === 401) {
            logout();
        }
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

export const fetchDayTimetable = async () => {
    return fetchWithAuth('/timetable/daytimetable.json');
};

export const fetchDailyNews = async () => {
    return fetchWithAuth('/dailynews/list.json');
};

export const fetchUserInfo = async () => {
    return fetchWithAuth('/details/userinfo.json');
};
