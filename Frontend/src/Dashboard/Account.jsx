import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    Alert,
    IconButton,
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export function Account() {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        amsUserFname: '',
        amsUserLname: '',
        amsUsername: '',
        currentPassword: '',
        amsPassword: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            const username = localStorage.getItem('username');
            
            if (!token || !username) {
                console.log('No token found, redirecting to login');
                navigate('/login');
                return;
            }

            if (!user?.id) {
                console.log('No user ID found');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    `http://localhost:8080/api/users/getUser/${user.id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                console.log('Fetched user data:', response.data);
                const userData = response.data;

                setFormData(prev => ({
                    ...prev,
                    amsUserFname: userData.amsUserFname || '',
                    amsUserLname: userData.amsUserLname || '',
                    amsUsername: userData.amsUsername || '',
                    currentPassword: '',
                    amsPassword: '',
                    confirmPassword: '',
                }));
            } catch (error) {
                console.error('Error fetching user data:', error);
                if (error.response?.status === 403) {
                    console.log('Session expired or invalid token');
                    navigate('/login');
                } else {
                    setMessage({ 
                        type: 'error', 
                        text: error.response?.data?.message || 'Failed to load user data' 
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user?.id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = () => {
        setIsEditing(true);
        setMessage({ type: '', text: '' });
    };

    const handleCancel = () => {
        // Reset form to original data
        setFormData({
            amsUserFname: user.amsUserFname,
            amsUserLname: user.amsUserLname,
            amsUsername: user.username,
            currentPassword: '',
            amsPassword: '',
            confirmPassword: '',
        });
        setIsEditing(false);
        setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        if (!token || !username) {
            navigate('/login');
            return;
        }


        if (formData.amsPassword && formData.amsPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setLoading(false);
            return;
        }

        try {
            const updateData = {
                amsUserFname: formData.amsUserFname,
                amsUserLname: formData.amsUserLname,
                amsUsername: formData.amsUsername,
                amsPassword: formData.amsPassword || undefined,
                currentPassword: formData.currentPassword
            };

            const response = await axios.put(
                `http://localhost:8080/api/users/updateUser/${user.id}`, 
                updateData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setMessage({ type: 'success', text: 'Account updated successfully' });
            setIsEditing(false);
            
            // Update the user context with new data
            login({
                ...user,
                amsUsername: formData.amsUsername,
                amsUserFname: formData.amsUserFname,
                amsUserLname: formData.amsUserLname,
            });

            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                amsPassword: '',
                confirmPassword: '',
            }));
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to update account'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">
                        Account Details
                    </Typography>
                    {!isEditing ? (
                        <Button
                            startIcon={<EditIcon />}
                            onClick={handleEdit}
                            variant="outlined"
                            disabled={loading} 
                        >
                            Edit Profile
                        </Button>
                    ) : (
                        <Stack direction="row" spacing={1}>
                            <Button
                                startIcon={<CancelIcon />}
                                onClick={handleCancel}
                                variant="outlined"
                                color="error"
                            >
                                Cancel
                            </Button>
                            <Button
                                startIcon={<SaveIcon />}
                                onClick={handleSubmit}
                                variant="contained"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Stack>
                    )}
                </Box>

                {message.text && (
                    <Alert severity={message.type} sx={{ mb: 2 }}>
                        {message.text}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            label="First Name"
                            name="amsUserFname"
                            value={formData.amsUserFname}
                            onChange={handleChange}
                            fullWidth
                            disabled={!isEditing}
                        />
                        
                        <TextField
                            label="Last Name"
                            name="amsUserLname"
                            value={formData.amsUserLname}
                            onChange={handleChange}
                            fullWidth
                            disabled={!isEditing}
                        />

                        <TextField
                            label="Username"
                            name="amsUsername"
                            value={formData.amsUsername}
                            onChange={handleChange}
                            fullWidth
                            disabled={!isEditing}
                        />

                        {isEditing && (
                            <>
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    Change Password (Optional)
                                </Typography>

                                <TextField
                                    label="Current Password"
                                    name="currentPassword"
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    fullWidth
                                />

                                <TextField
                                    label="New Password"
                                    name="amsPassword"
                                    type="password"
                                    value={formData.amsPassword}
                                    onChange={handleChange}
                                    fullWidth
                                />

                                <TextField
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </>
                        )}
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}
