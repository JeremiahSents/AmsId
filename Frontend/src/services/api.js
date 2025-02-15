import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
console.log("API Base URL:", API_URL);

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
        // console.log("Request Interceptor - Config:", config); // **ADD THIS LOG**
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`
            };
            console.log("Request Interceptor - Token Added:", token); // **ADD THIS LOG**
        } else {
            console.log("Request Interceptor - No Token Found in localStorage"); // **ADD THIS LOG**
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor remains the same...
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error("Response error:", error.response.data);
            throw new Error(error.response.data?.message || "An error occurred");
        } else if (error.request) {
            console.error("Network Error:", error.request);
            throw new Error("Network Error");
        } else {
            console.error("Error Message:", error.message);
            throw new Error("Something went wrong");
        }
    }
);

export const signup = async (userData) => {
    try {
        const response = await api.post("/users/createUser", userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Signup failed");
    }
};

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
        
        // Handle specific error cases
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    if (error.response.data?.message?.includes('username')) {
                        throw new Error("Invalid username");
                    } else {
                        throw new Error("Invalid password");
                    }
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

export const generateSerialNumber = async () => {
    try {
        const response = await api.get("/serial/generate");
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to generate serial number");
    }
};

export const getCategories = async () => {
    try {
        const response = await api.get("/categories");
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch categories");
    }
};

export default api;
