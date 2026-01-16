import axios from "axios";

/**
 * Global API Client configured with Interceptors.
 * This ensures all requests follow the same security standards and error handling logic.
 */
const apiClient = axios.create({
  // Uses the environment variable defined in COMPLETE_SETUP.md
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * REQUEST INTERCEPTOR
 * Automatically attaches the JWT 'Bearer' token to every outgoing request.
 */
apiClient.interceptors.request.use(
  (config) => {
    // ✅ FIXED: Changed "token" to "quest_token"
    const token = typeof window !== "undefined" ? localStorage.getItem("quest_token") : null;
    
    if (token && config.headers) {
      // Formats the header as expected by the FastAPI HTTPBearer security scheme
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Centralized error handling for authentication failures and session management.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Specifically catches 401 Unauthorized errors from the backend
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Clear local session data to prevent invalid requests
        localStorage.removeItem("quest_token");
        localStorage.removeItem("quest_user");
        
        // Redirect the user to the login page if they are not already on an auth-related page
        const isAuthPage = window.location.pathname.includes("/login") || 
                           window.location.pathname.includes("/signup");
                           
        if (!isAuthPage) {
          window.location.href = "/login";
        }
      }
    }
    
    // Returns the error so it can be handled by individual services or hooks
    return Promise.reject(error);
  }
);

export default apiClient;