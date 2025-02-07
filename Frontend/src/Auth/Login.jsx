/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import { Button, TextField, Stack, Box, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import logo from '../assets/amsLogo.png';
import React, { useState } from 'react';
import { login as loginApi } from "../services/api.js";
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [formData, setFormData] = useState({
    amsUsername: '', 
    amsUserPassword: '' 
  });
  

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await loginApi(formData);
      const userData = response.data; // This is now the AmsUserDto from backend
  

      console.log("Login API response data:", userData);
      // localStorage.setItem("token", response.data.token);

        localStorage.setItem('accessToken', userData.accessToken);
        localStorage.setItem('refreshToken', userData.refreshToken); 
        localStorage.setItem('username', userData.amsUsername);
        // localStorage.setItem('token', userData.token);
       
        
      // Store user data in auth context with all fields
      login({ 
        username: userData.amsUsername,
        amsUserFname: userData.amsUserFname,
        amsUserLname: userData.amsUserLname,
        id: userData.id
      });
      
      // You might want to remove this if you're not using tokens
      // localStorage.setItem('token', userData.token);
      
      navigate("/home");
    } catch (error) {
      console.error(error);
      setError(error.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <img src={logo} alt="AMS Logo" />
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ maxWidth: 400, width: "100%" }}>
          <TextField
            label="Username"
            name="amsUsername"
            value={formData.amsUsername}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Password"
            type="password"
            name="amsUserPassword"
            value={formData.amsUserPassword}
            onChange={handleChange}
            fullWidth
          />

          {error && <Typography color="error">{error}</Typography>}

          <Button 
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </Button>

          <Stack direction="row" spacing={1} justifyContent="center">
            <Typography>Don't have an account?</Typography>
            <Link to="/signup" style={{ color: "primary" }}>Register</Link>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
}
