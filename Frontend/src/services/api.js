import axios from "axios";

const API_URL = "http://localhost:8080";
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
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`
            };
        }
        // console.log("Request config:", {
        //     url: config.url,
        //     headers: config.headers,
        //     token: token
        // });
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor remains the same...
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
            throw error.response.data;
        } else if (error.request) {
            console.error('Network Error:', error.request);
            throw new Error("Network Error");
        } else {
            console.error('Error Message:', error.message);
            throw new Error("Something went wrong");
        }
    }
);

// Add back the signup function
export const signup = async (userData) => {
    try {
        const response = await api.post('/api/users/createUser', userData);  // Make sure this matches your backend endpoint
        return response.data;
    } catch (error) {
        if (error.response) {
            throw error.response.data;
        }
        throw new Error('Network error. Please check your connection.');
    }
};

export const login = async (credentials) => {
    try {
        const response = await api.post('/api/users/login', credentials);

     if(response.data.accessToken){
     localStorage.setItem("token",response.data.accessToken);
     console.log("Stored Token:", localStorage.getItem("token"));
     }

        // if (response.data.Token) {
        //     localStorage.setItem('accessToken', response.data.accessToken);  // Store the token in localStoragetoken);
        //     localStorage.setItem('refreshToken', response.data.refreshToken);
        //     console.log('Token saved:', response.data.token);}
          else {
            console.error('No token received in login response');
        }
        return response;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw new Error('Invalid username or password');
        }
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};

export const generateSerialNumber = async () => {
    try {
        const response = await api.get('/api/serial/generate');
        return response.data;
    } catch (error) {
        console.error('Error generating serial number:', error);
        throw error;
    }
};

export const getCategories = async () => {
    try {
        const response = await api.get('http://localhost:8080/api/categories');
        console.log('Categories API response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
};

export default api;