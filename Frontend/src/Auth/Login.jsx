/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import { Button, TextField, Stack, Box, Typography, Container, Alert, AlertTitle } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import logo from '../assets/amsLogo.png';
import React, { useState } from 'react';
import { login as loginApi } from "../services/api.js";
import { useAuth } from '../context/AuthContext';
import { API_URL } from "../services/api";

export function Login() {
  const [formData, setFormData] = useState({
    amsUsername: '', 
    amsUserPassword: '' 
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
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
    console.log("API Base URL:", API_URL);

    try {
      const userData = await loginApi(formData);
      
      if (!userData) {
        throw new Error("No data received from server");
      }

      if (userData.accessToken) {
        localStorage.setItem('accessToken', userData.accessToken);
      }
      if (userData.refreshToken) {
        localStorage.setItem('refreshToken', userData.refreshToken);
      }
      if (userData.amsUsername) {
        localStorage.setItem('username', userData.amsUsername);
      }
      
      login({ 
        username: userData.amsUsername,
        amsUserFname: userData.amsUserFname,
        amsUserLname: userData.amsUserLname,
        id: userData.id
      });
      
      setAttempts(0);
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      setAttempts(prev => prev + 1);
      
      if (error.message.includes("Invalid username")) {
        setError("Username not found. Please check your username or sign up for a new account.");
      } else if (error.message.includes("Invalid password")) {
        setError("Incorrect password. Please try again or reset your password.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderErrorAlert = () => {
    if (!error) return null;
    
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        action={
          attempts >= 3 && (
            <Link 
              to="/forgot-password" 
              style={{ textDecoration: 'none' }}
            >
              <Button color="error" size="small">
                Reset Password
              </Button>
            </Link>
          )
        }
      >
        {error}
        {attempts >= 3 && (
          <Typography variant="body3" sx={{ mt: 1, fontSize: '0.875rem' }}>
            Having trouble? You can reset your password
          </Typography>
        )}
      </Alert>
    );
  };

  return (
    <Container maxWidth="sm" sx={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 400, p: 3, textAlign: "center", boxShadow: 3, borderRadius: 2, bgcolor: "background.paper" }}>
        <img src={logo} alt="AMS Logo" style={{ maxWidth: "100%", height: "auto", marginBottom: "20px" }} />
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {renderErrorAlert()}
            
            <TextField
              label="Username"
              name="amsUsername"
              value={formData.amsUsername}
              onChange={handleChange}
              fullWidth
              error={!!error && error.includes("username")}
            />

            <TextField
              label="Password"
              type="password"
              name="amsUserPassword"
              value={formData.amsUserPassword}
              onChange={handleChange}
              fullWidth
              error={!!error && error.includes("password")}
            />

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
            
            {attempts >= 3 && (
              <Stack direction="row" spacing={1} justifyContent="center">
                <Link 
                  to="/contact-support" 
                  style={{ color: "primary", textDecoration: 'none' }}
                >
                  Need help? Contact Support
                </Link>
              </Stack>
            )}
          </Stack>
        </form>
      </Box>
    </Container>
  );
}