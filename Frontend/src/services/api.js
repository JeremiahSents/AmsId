import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
});

// Request interceptor to add token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Flag to prevent multiple refresh attempts at the same time
let isRefreshing = false;
let failedRequestsQueue = [];

// Response interceptor to refresh token if expired
api.interceptors.response.use(
    (response) => response,
    
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedRequestsQueue.push({ resolve, reject });
                })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axios(originalRequest);
                })
                .catch((err) => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");

                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }

                const response = await axios.post(`${API_URL}/api/auth/refresh-token`, { refreshToken });

                const newAccessToken = response.data.accessToken;
                localStorage.setItem("accessToken", newAccessToken);

                // Retry failed requests with new token
                failedRequestsQueue.forEach((req) => req.resolve(newAccessToken));
                failedRequestsQueue = [];

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axios(originalRequest);
            } catch (refreshError) {
                failedRequestsQueue.forEach((req) => req.reject(refreshError));
                failedRequestsQueue = [];

                localStorage.clear();
                window.location.href = "/login"; // Redirect to login page
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// Signup function
export const signup = async (userData) => {
    try {
        const response = await api.post("/users/createUser", userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Signup failed");
    }
};

// Login function
export const login = async (credentials) => {
    try {
        const response = await api.post("/users/login", credentials);
        const userData = response.data;

        if (!userData) {
            throw new Error("No response data received from server");
        }

        const requiredFields = ['accessToken', 'refreshToken', 'amsUsername', 'amsUserFname', 'amsUserLname', 'id'];
        const missingFields = requiredFields.filter(field => !userData[field]);

        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        localStorage.setItem("accessToken", userData.accessToken);
        localStorage.setItem("refreshToken", userData.refreshToken);
        localStorage.setItem("username", userData.amsUsername);

        return userData;
    } catch (error) {
        console.error("Login API Error:", error);
        
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    throw new Error("Invalid username or password");
                case 404:
                    throw new Error("Invalid username");
                case 429:
                    throw new Error("Too many login attempts. Please try again later.");
                case 503:
                    throw new Error("Service temporarily unavailable. Please try again later.");
                default:
                    throw new Error("Login failed. Please try again.");
            }
        }

        throw new Error(error.message || "Login failed. Please try again.");
    }
};

// Generate Serial Number
export const generateSerialNumber = async () => {
    try {
        const response = await api.get("/serial/generate");
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to generate serial number");
    }
};

// Get Categories
export const getCategories = async () => {
    try {
        const response = await api.get("/categories");
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch categories");
    }
};

export default api;