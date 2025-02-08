/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import { Button, TextField, Stack, Box, Typography, Container } from "@mui/material";
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
      const userData = response.data;

      console.log("Login API response data:", userData);
      
      localStorage.setItem('accessToken', userData.accessToken);
      localStorage.setItem('refreshToken', userData.refreshToken); 
      localStorage.setItem('username', userData.amsUsername);
      
      login({ 
        username: userData.amsUsername,
        amsUserFname: userData.amsUserFname,
        amsUserLname: userData.amsUserLname,
        id: userData.id
      });
      
      navigate("/home");
    } catch (error) {
      console.error(error);
      setError(error.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 400, p: 3, textAlign: "center", boxShadow: 3, borderRadius: 2, bgcolor: "background.paper" }}>
        <img src={logo} alt="AMS Logo" style={{ maxWidth: "100%", height: "auto", marginBottom: "20px" }} />
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
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
              fullWidth
            >
              {loading ? "Loading..." : "Login"}
            </Button>

            <Stack direction="row" spacing={1} justifyContent="center">
              <Typography>Don't have an account?</Typography>
              <Link to="/signup" style={{ color: "primary" }} underline="hover">Register</Link>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Container>
  );
}
