import { useEffect, useState } from "react";
import { 
  Box, 
  IconButton, 
  CircularProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Collapse,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon ,ExpandLess as ExpandLessIcon} from "@mui/icons-material";

import axios from "axios";
import { getCategories } from '../services/api';
import PropTypes from 'prop-types';


const ClientTable = () => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // Define baseUrl here
  const baseUrl = import.meta.env.VITE_API_URL || 'http://18.191.168.91:8080';

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', message: '' });
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredClients, setFilteredClients] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);

  const fetchData = async () => {
    const token = localStorage.getItem("accessToken");
    console.log("Token Retrieved from Storage:", token); 
  
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
  
      const [clientsResponse, categoriesResponse] = await Promise.all([
        axios.get(`${baseUrl}/clients/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }),
        getCategories() // Assuming this returns an array like [{ id: 1, name: "General" }, ...]
      ]);
  
      const clientsData = Array.isArray(clientsResponse.data) ? clientsResponse.data : [];
  
      // Merge category names into client objects based on categoryId
      const mergedClients = clientsData.map(client => {
        // Find matching category by comparing client.categoryId with category.id
        const category = categoriesResponse.find(cat => cat.id === client.categoryId);
        return {
          ...client,
          // Add a new property for the category name
          categoryName: category ? category.name : "Unknown"
        };
      });
  
      // Optionally filter out clients with missing fields if needed:
      const validClients = mergedClients.filter(client =>
        client && client.kpClientId != null && client.kpClientSerialNumber != null
      );
  
      setClients(validClients);
      setCategories(categoriesResponse); // For filtering dropdown, etc.
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch data');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };
  


  useEffect(() => {
    let mounted = true;

    const initData = async () => {
      if (mounted) {
        await fetchData();
      }
    };

    initData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredClients(clients);
    } else {
      setFilteredClients(clients.filter(client => 
        client.categoryName === selectedCategory
      ));
    }
  }, [selectedCategory, clients]);

  const handleUpdate = (client) => {
    setSelectedClient(client);
    setEditDialog(true);
  };

  const handleUpdateSubmit = async () => {
    if (!selectedClient?.kpClientId) {
        setUpdateMessage({ type: 'error', message: 'Invalid client ID' });
        return;
    }

    setUpdating(true);
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error('No authentication token found');
        }

        await axios.put(
            `${baseUrl}/clients/updateClient/${selectedClient.kpClientId}`,
            {
                kpClientId: selectedClient.kpClientId,
                kpClientFName: selectedClient.kpClientFName.trim(),
                kpClientLName: selectedClient.kpClientLName.trim(),
                categoryRegistered: selectedClient.categoryRegistered,
                kpClientSerialNumber: selectedClient.kpClientSerialNumber,
                kpClientTimeAssigned: selectedClient.kpClientTimeAssigned,
                registeredBy: selectedClient.registeredBy,
                registeredByUsername: selectedClient.registeredByUsername
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        setEditDialog(false);
        await fetchData(); // Refresh the table
        setUpdateMessage({ type: 'success', message: 'Client updated successfully' });
    } catch (error) {
        console.error('Update error:', error);
        const errorMessage = error.response?.status === 403 
            ? 'Authentication failed. Please log in again.'
            : error.response?.data?.message || error.message || 'Failed to update client';
        setUpdateMessage({ type: 'error', message: errorMessage });
    } finally {
        setUpdating(false);
    }
};

const handleDeleteSubmit = async () => {
    if (!selectedClient?.kpClientId) {
        setUpdateMessage({ type: 'error', message: 'Invalid client ID' });
        return;
    }

    setDeleting(true);
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error('No authentication token found');
        }

        await axios.delete(
            `${baseUrl}/clients/deleteClient/${selectedClient.kpClientId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        setDeleteDialog(false);
        await fetchData(); // Refresh the table
        setUpdateMessage({ type: 'success', message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        const errorMessage = error.response?.status === 403 
            ? 'Authentication failed. Please log in again.'
            : error.response?.data?.message || error.message || 'Failed to delete client';
        setUpdateMessage({ type: 'error', message: errorMessage });
    } finally {
        setDeleting(false);
    }
};

const handleDeleteConfirm = (client) => {
    setSelectedClient(client);
    setDeleteDialog(true);
};

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  if (loading) {
    return <CircularProgress size={40} />;
  }

  if (error) {
    return (
      <Box sx={{ p: 5 }}>
        <Typography color="error">Error: {error}</Typography>
        <Typography sx={{ mt: 2 }}>Please check:</Typography>
        <Typography>1. Backend server is running</Typography>
        <Typography>2. VITE_API_URL is correct in .env file</Typography>
        <Typography>3. API endpoint path is correct</Typography>
      </Box>
    );
  }
  const MobileClientCard = ({ client, index }) => {
    const isExpanded = expandedCard === index;
    
    return (
      <Card sx={{ mb: 2, width: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">
              {client.kpClientFName} {client.kpClientLName}
            </Typography>
            <IconButton onClick={() => setExpandedCard(isExpanded ? null : index)}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Typography color="textSecondary" gutterBottom>
            ID: {client.kpClientId}
          </Typography>
          
          <Collapse in={isExpanded}>
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Typography>
                <strong>Serial Number:</strong> {client.kpClientSerialNumber || 'N/A'}
              </Typography>
              <Typography>
                <strong>Time Assigned:</strong> {client.kpClientTimeAssigned ? 
                  new Date(client.kpClientTimeAssigned).toLocaleString() : 
                  'N/A'}
              </Typography>
              <Typography>
                <strong>Registered By:</strong> {client.registeredByUsername || client.registeredBy || 'N/A'}
              </Typography>
              <Typography>
                <strong>Category:</strong> {client.categoryName || 'N/A'}
              </Typography>
            </Stack>
          </Collapse>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <IconButton onClick={() => handleUpdate(client)} size="small">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDeleteConfirm(client)} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Add prop types validation
  MobileClientCard.propTypes = {
    client: PropTypes.shape({
      kpClientFName: PropTypes.string.isRequired,
      kpClientLName: PropTypes.string.isRequired,
      kpClientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      kpClientSerialNumber: PropTypes.string,
      kpClientTimeAssigned: PropTypes.string,
      registeredByUsername: PropTypes.string,
      registeredBy: PropTypes.string,
      categoryName: PropTypes.string,
    }).isRequired,
    index: PropTypes.number.isRequired,
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
        <Typography variant="body1" sx={{ mt: 2 }}>Please check:</Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Typography>1. Backend server is running</Typography>
          <Typography>2. VITE_API_URL is correct in .env file</Typography>
          <Typography>3. API endpoint path is correct</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 5 }, overflowX: "auto" }}>
      {updateMessage.message && (
        <Alert 
          severity={updateMessage.type} 
          sx={{ mb: 2 }}
          onClose={() => setUpdateMessage({ type: '', message: '' })}
        >
          {updateMessage.message}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ width: { xs: '100%', sm: 200 } }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Filter by Category"
            onChange={handleCategoryChange}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.name}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {isMobile ? (
        // Mobile view using cards
        <Stack spacing={2}>
          {filteredClients.map((client, index) => (
            <MobileClientCard 
              key={client.kpClientId || `client-${index}`} 
              client={client}
              index={index}
            />
          ))}
        </Stack>
      ) : (
        // Desktop view using table
        <TableContainer component={Paper}>
          <Table size={isSmall ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Time Assigned</TableCell>
                <TableCell>Registered By</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.map((client, index) => (
                <TableRow key={client.kpClientId || `client-${index}`}>
                  <TableCell>{client.kpClientId}</TableCell>
                  <TableCell>{client.kpClientFName}</TableCell>
                  <TableCell>{client.kpClientLName}</TableCell>
                  <TableCell>{client.kpClientSerialNumber || 'N/A'}</TableCell>
                  <TableCell>
                    {client.kpClientTimeAssigned ? 
                      new Date(client.kpClientTimeAssigned).toLocaleString() : 
                      'N/A'}
                  </TableCell>
                  <TableCell>{client.registeredByUsername || client.registeredBy || 'N/A'}</TableCell>
                  <TableCell>{client.categoryName || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleUpdate(client)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error"
                      onClick={() => handleDeleteConfirm(client)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={editDialog} 
        onClose={() => setEditDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Client</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="First Name"
              value={selectedClient?.kpClientFName || ''}
              onChange={(e) => setSelectedClient({
                ...selectedClient,
                kpClientFName: e.target.value
              })}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={selectedClient?.kpClientLName || ''}
              onChange={(e) => setSelectedClient({
                ...selectedClient,
                kpClientLName: e.target.value
              })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedClient?.categoryRegistered || ''}
                label="Category"
                onChange={(e) => setSelectedClient({
                  ...selectedClient,
                  categoryRegistered: e.target.value
                })}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialog(false)} disabled={updating}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateSubmit} 
            variant="contained" 
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog} 
        onClose={() => setDeleteDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete client {selectedClient?.kpClientFName} {selectedClient?.kpClientLName}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteSubmit} 
            color="error" 
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientTable;