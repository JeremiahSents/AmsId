import {
    Box,
    Stack,
    Typography,
    Button,
    TextField,
    Paper,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    AlertTitle,
} from "@mui/material";
import {
    Person as PersonIcon,
    List as ListIcon,
    Logout as LogoutIcon,
    Search as SearchIcon,
    ManageAccounts as ManageAccountsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
// import axios from 'axios';
import api from "../services/api";
import { generateSerialNumber, getCategories } from '../services/api';

export function Home() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const bgColor = "grey.100";

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
    const [serialNumberFetched, setSerialNumberFetched] = useState(false); // Track if serial number was fetched
    const OTHER_CATEGORY_VALUE = "Other";

    useEffect(() => {
        // Check authentication first
        const token = localStorage.getItem('token');
        if (!token || !user) {
            console.log('No token found or user not authenticated');
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // const [serialNumber, categoriesList] = await Promise.all([
                //     generateSerialNumber(),
                //     getCategories()
                // ]);
               if(!serialNumberFetched){
                const serialNumber = await generateSerialNumber();
                console.log("Fetched serial number:", serialNumber);

                setFormData(prev => ({
                    ...prev,
                    serialNumber: serialNumber.toString()
                }));
                setSerialNumberFetched(true);
               }
                const categoriesList = await getCategories();
                
                // console.log('Fetched serial number:', serialNumber);
                console.log('Raw categories data:', categoriesList);
                
                if (!Array.isArray(categoriesList)) {
                    throw new Error('Categories data is not in the expected format');
                }

               setCategories(categoriesList);

                // setFormData(prev => ({
                //     ...prev,
                //     serialNumber: serialNumber.toString()
                // }));
                // setCategories(categoriesList);
            } catch (err) {
                console.error("Error fetching data:", err);
                if (err.message === 'No authentication token found') {
                    navigate('/login');
                } else {
                    setError("Failed to load data. Please refresh the page.");
                }
            }
        };

        fetchData();
    }, [navigate, user,serialNumberFetched]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
        if (formData.categoryId === OTHER_CATEGORY_VALUE && !formData.newCategoryName.trim()) {
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


        if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
            setError("Please fill in all required fields");
            return;
        }
         
        if (!formData.categoryId && formData.categoryId !== OTHER_CATEGORY_VALUE) {
            setError("Please select a category."); // Error if no category selected and not 'Other'
            return;
        }
    
        if (formData.categoryId === OTHER_CATEGORY_VALUE && !formData.newCategoryName.trim()) {
            setError("Please enter a new category name for 'Other' category."); // Error if 'Other' but no new category name
            return;
        }


        setLoading(true);
        try {
            const clientData = {
                kpClientFName: formData.firstName.trim(),
                kpClientLName: formData.lastName.trim(),
                categoryId: formData.categoryId === OTHER_CATEGORY_VALUE ? null : parseInt(formData.categoryId, 10), // Send null if 'Other', backend will handle new category
                newCategoryName: formData.categoryId === OTHER_CATEGORY_VALUE ? formData.newCategoryName.trim() : null, // Send new category name if 'Other'
                registeredBy: user.username,
                kpClientSerialNumber: formData.serialNumber
            };

            console.log('Submitting client data:', clientData);


            const response = await api.post(
                '/api/clients/register',
                clientData
            );

            // const response = await axios.post(
            //     'http://localhost:8080/api/clients/register',
            //     clientData,
            //     {
            //         headers: {
            //             Authorization: `Bearer ${token}`, // Attach token if required
            //             'Content-Type': 'application/json',
            //         },
            //     }
            // );

            if (response.status === 201) {
                // Get new serial number for next client
                const newSerialNumber = await generateSerialNumber();
                
                // Reset form with new serial number
                setFormData({
                    serialNumber: newSerialNumber.toString(),
                    firstName: "",
                    lastName: "",
                    categoryId: "",
                    newCategoryName: "",
                });
                setSerialNumberFetched(false);
                setError("");
                setSuccessMessage("Client registered successfully!");
                
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            }
        } catch (error) {
            console.error("Registration error:", error);
            const errorMessage = error.response?.data?.message || 
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

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: bgColor }}>
            {/* Sidebar */}
            <Stack
                spacing={2}
                sx={{
                    width: 250,
                    p: 2,
                    bgcolor: "primary.main",
                    color: "white"
                }}
            >
                <Typography variant="h5" fontWeight="bold">
                    AMS Dashboard
                </Typography>

                <Button
                    variant="text"
                    color="inherit"
                    startIcon={<SearchIcon />}
                    onClick={() => navigate("/find-client")}
                >
                    Find Client by ID
                </Button>

                <Button
                    variant="text"
                    color="inherit"
                    startIcon={<ManageAccountsIcon />}
                    onClick={() => navigate("/account")}
                >
                    Manage Account
                </Button>

                <Button
                    variant="text"
                    color="inherit"
                    startIcon={<ListIcon />}
                    onClick={() => navigate("/clients")}
                >
                    Find All Patients
                </Button>

                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    sx={{ mt: "auto" }}
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </Stack>

            {/* Main Content */}
            <Stack spacing={4} sx={{ flex: 1, p: 4, alignItems: "center" }}>
                <Paper sx={{ p: 2, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PersonIcon />
                        <Typography variant="h6">Welcome, {user?.username}</Typography>
                    </Box>
                </Paper>

                <Paper sx={{ p: 4, maxWidth: 600, width: "100%" }}>
                    <Typography variant="h5" gutterBottom>
                        Patient Intake Form
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            <AlertTitle>Error</AlertTitle>
                            {error}
                        </Alert>
                    )}

                    {successMessage && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            <AlertTitle>Success</AlertTitle>
                            {successMessage}
                        </Alert>
                    )}

                    <Stack spacing={2} component="form" sx={{ mt: 2 }}>
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
                                <MenuItem value={OTHER_CATEGORY_VALUE}> {/* "Other" Option */}
                                    Other
                                </MenuItem>
                            </Select>
                        </FormControl>

                        {/* Conditionally render new category input */}
                        {formData.categoryId === OTHER_CATEGORY_VALUE && (
                            <TextField
                                label="New Category Name"
                                name="newCategoryName"
                                value={formData.newCategoryName}
                                onChange={handleChange}
                                fullWidth
                                required // Make required when "Other" is selected
                            />
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Submit'}
                        </Button>
                    </Stack>
                </Paper>
            </Stack>
        </Box>
    );
}
