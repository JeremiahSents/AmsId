import {Box,Stack,Typography,Button,TextField,Paper,CircularProgress,
  Select,MenuItem,FormControl,InputLabel,Alert,AlertTitle,Drawer,
  IconButton,AppBar,Toolbar,Container,useTheme,useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Person as PersonIcon,
  List as ListIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  ManageAccounts as ManageAccountsIcon,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getCategories, generateSerialNumberForForm } from "../services/api";

const baseUrl = import.meta.env.VITE_API_URL || "http://18.191.168.91:8080";
export function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const bgColor = "grey.100";
  const OTHER_CATEGORY_VALUE = "Other";

  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // For mobile menu

  const [formData, setFormData] = useState({
    serialNumber: "",
    firstName: "",
    lastName: "",
    categoryId: "",
    newCategoryName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || !user) {
      // console.log("No token found or user not authenticated");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const categoriesList = await getCategories();
        // console.log("Raw categories data:", categoriesList);

        if (!Array.isArray(categoriesList)) {
          throw new Error("Categories data is not in the expected format");
        }

        setCategories(categoriesList);
      } catch (err) {
        // console.error("Error fetching data:", err);
        if (err.message === "No authentication token found") {
          navigate("/login");
        } else {
          setError("Failed to load data. Please refresh the page.");
        }
      }
    };

    fetchData();
  }, [navigate, user]);

  useEffect(() => {
    const fetchSerialNumberForForm = async () => {
      try {
        const serialNumber = await generateSerialNumberForForm();
        console.log("Fetched serial number for form:", serialNumber);
        const serialNumberString = serialNumber.toString();
        setFormData((prev) => ({
          ...prev,
          serialNumber: serialNumberString,
        }));
      } catch (error) {
        console.error("Error fetching serial number for form:", error);
        setError("Failed to fetch serial number. Please try again later.");
      }
    };

    fetchSerialNumberForForm();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.firstName?.trim()) {
      errors.push("First name is required");
    }
    if (!formData.lastName?.trim()) {
      errors.push("Last name is required");
    }
    if (!formData.categoryId) {
      errors.push("Category is required");
    }
    if (
      formData.categoryId === OTHER_CATEGORY_VALUE &&
      !formData.newCategoryName.trim()
    ) {
      errors.push("Please enter a new category name for 'Other' category.");
    }
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(", "));
      return;
    }

    setLoading(true);
    setError(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success message
    try {
      const clientData = {
        kpClientFName: formData.firstName.trim(),
        kpClientLName: formData.lastName.trim(),
        categoryId:
          formData.categoryId === OTHER_CATEGORY_VALUE
            ? null
            : parseInt(formData.categoryId, 10),
        newCategoryName:
          formData.categoryId === OTHER_CATEGORY_VALUE
            ? formData.newCategoryName.trim()
            : null,
        registeredBy: user.username,
        // kpClientSerialNumber: formData.serialNumber,
      };

      // console.log("Submitting client data:", clientData);
      // console.log("Registration Request URL:", `${baseUrl}/clients/register`); // Log URL
      // console.log("Registration Request Headers (before api.post):", api.defaults.headers.common); // Log headers

      const response = await api.post(
        `${baseUrl}/clients/register`,
        clientData
      ); // **CORRECTED LINE - URL and data are separate arguments**

      if (response.status === 201) {
        // localStorage.removeItem("serialNumber");
        // const newSerialNumber = await generateSerialNumber();
        // const newSerialNumberString = newSerialNumber.toString();
        // localStorage.setItem("serialNumber", newSerialNumberString);

        setFormData({
          serialNumber: "",
          firstName: "",
          lastName: "",
          categoryId: "",
          newCategoryName: "",
        });

        setError("");
        setSuccessMessage("Client registered successfully!");

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Failed to register client";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <Stack spacing={3} sx={{ p: 3, color: "white", height: "100%" }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
        AMS Dashboard
      </Typography>

      <Stack spacing={2}>
        <Button
          variant="text"
          color="inherit"
          startIcon={<SearchIcon />}
          onClick={() => {
            navigate("/find-client");
            if (isMobile) setIsDrawerOpen(false);
          }}
          fullWidth
          sx={{ justifyContent: "flex-start" }}
        >
          Find Client by ID
        </Button>

        <Button
          variant="text"
          color="inherit"
          startIcon={<ManageAccountsIcon />}
          onClick={() => {
            navigate("/account");
            if (isMobile) setIsDrawerOpen(false);
          }}
          fullWidth
          sx={{ justifyContent: "flex-start" }}
        >
          Manage Account
        </Button>

        <Button
          variant="text"
          color="inherit"
          startIcon={<ListIcon />}
          onClick={() => {
            navigate("/clients");
            if (isMobile) setIsDrawerOpen(false);
          }}
          fullWidth
          sx={{ justifyContent: "flex-start" }}
        >
          Find All Patients
        </Button>
      </Stack>

      <Button
        variant="outlined"
        color="error"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{ mt: "auto" }}
        fullWidth
      >
        Logout
      </Button>
    </Stack>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: bgColor }}>
      {/* Mobile App Bar */}
      <AppBar
        position="fixed"
        sx={{
          display: { xs: "block", md: "none" },
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            AMS Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar - Permanent for desktop, Drawer for mobile */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            width: 280,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: 280,
              bgcolor: "primary.main",
            },
          }}
        >
          <Toolbar /> {/* Spacer for AppBar */}
          <SidebarContent />
        </Drawer>
      ) : (
        <Box
          component="nav"
          sx={{
            width: 280,
            flexShrink: 0,
            bgcolor: "primary.main",
            height: "100vh",
            position: "sticky",
            top: 0,
          }}
        >
          <SidebarContent />
        </Box>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: "100%",
          mt: { xs: "64px", md: 0 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4}>
            {/* Welcome Card */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <PersonIcon color="primary" />
              <Typography variant="h6">Welcome, {user?.username}</Typography>
            </Paper>

            {/* Form Card */}
            <Paper
              elevation={2}
              sx={{
                p: 4,
                width: "100%",
                maxWidth: "800px",
                mx: "auto",
              }}
            >
              <Typography variant="h5" gutterBottom>
                Patient Intake Form
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <AlertTitle>Error</AlertTitle>
                  {error}
                </Alert>
              )}

              {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  <AlertTitle>Success</AlertTitle>
                  {successMessage}
                </Alert>
              )}

              <Stack spacing={3} component="form">
                <TextField
                  label="Serial Number"
                  value={formData.serialNumber}
                  disabled
                  fullWidth
                />
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="categoryId"
                    value={formData.categoryId}
                    label="Category"
                    onChange={handleChange}
                  >
                    <MenuItem value="">
                      <em>Select Category</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                    <MenuItem value={OTHER_CATEGORY_VALUE}>Other</MenuItem>
                  </Select>
                </FormControl>

                {formData.categoryId === OTHER_CATEGORY_VALUE && (
                  <TextField
                    label="New Category Name"
                    name="newCategoryName"
                    value={formData.newCategoryName}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                )}

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                  size="large"
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Submit"}
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
