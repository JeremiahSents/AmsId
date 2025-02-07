import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "@/Auth/Login.jsx";
import { Signup } from "@/Auth/Signup.jsx";
import { Home } from './Dashboard/Home.jsx';
import  ClientTable  from './Dashboard/ClientTable.jsx';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import { FindClient } from './Dashboard/FindClient';
import { Account } from './Dashboard/Account.jsx';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
// Import any other components as needed (e.g., AddClient, FindClient, AllClients)

const theme = createTheme({
  // You can customize your theme here
});

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="/home" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />
            <Route path="/find-client" element={
              <ProtectedRoute>
                <FindClient />
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute>
                <ClientTable />
              </ProtectedRoute>
            } />
            
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
