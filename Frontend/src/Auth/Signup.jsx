/* eslint-disable no-unused-vars */
import { Button, TextField, Stack, Box, Typography, Container } from "@mui/material";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";
import logo from '../assets/amsLogo.png';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"; 
import { signup } from "../services/api.js"; // Import the signup function


export function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    amsUserFname: '',
    amsUserLname: '',
    amsUsername: '',
    amsPassword: '',
    amsConfirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Reset any previous errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.amsPassword !== formData.amsConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const data = await signup(formData); // Call the signup function
      navigate("/login"); // Redirect to login on success
    } catch (error) {
      console.error(error);
      setError("An error occurred. Please try again."); // User-friendly error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", justifyContent: "center" }}>
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <img src={logo} alt="Logo" style={{ width: '100px', marginBottom: '20px' }} />
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ maxWidth: 400, width: "100%" }}>
          <TextField
            label="First Name"
            name="amsUserFname"
            value={formData.amsUserFname}
            onChange={handleChange}
            fullWidth
          />
          
          <TextField
            label="Last Name"
            name="amsUserLname"
            value={formData.amsUserLname}
            onChange={handleChange}
            fullWidth
          />
          
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
            name="amsPassword"
            value={formData.amsPassword}
            onChange={handleChange}
            fullWidth
          />
          
          <TextField
            label="Confirm Password"
            type="password"
            name="amsConfirmPassword"
            value={formData.amsConfirmPassword}
            onChange={handleChange}
            fullWidth
          />

          {error && <Typography color="error">{error}</Typography>}

          <Button 
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Loading..." : "Register"}
          </Button>
        </Stack>
      </form>
      
      <Stack direction="row" spacing={1} justifyContent="center">
        <Typography>Already have an account?</Typography>
        <Link to="/" style={{ color: "primary" }}>Login</Link>
      </Stack>
    </Box>
    </Container>
  )
};
