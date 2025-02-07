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
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import axios from "axios";
import { getCategories } from '../services/api';

const ClientTable = () => {
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

  const fetchData = async () => {

    const token = localStorage.getItem("token");
    console.log("Token Retrieved from Storage:", token); 

    setLoading(true);
    try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const token = localStorage.getItem("token");  // Retrieve token

        const [clientsResponse, categoriesResponse] = await Promise.all([
            axios.get(`${baseUrl}/api/clients/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,  // Include token
                }
            }),
            getCategories()
        ]);

        console.log('Clients data:', clientsResponse.data);
        const clientsData = Array.isArray(clientsResponse.data) ? clientsResponse.data : [];

        clientsData.forEach(client => {
          console.log(`Client ID: ${client.kpClientId}, Category: ${client.categoryRegistered}`);
      });

        setClients(clientsData.filter(client =>
            client && client.kpClientId != null && client.kpClientSerialNumber != null
        ));
        setCategories(categoriesResponse);
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
        client.categoryRegistered === selectedCategory
      ));
    }
  }, [selectedCategory, clients]);

  const handleUpdate = (client) => {
    setSelectedClient(client);
    setEditDialog(true);
  };

  const validateClient = (client) => {
    if (!client.kpClientFName?.trim()) {
        throw new Error('First name is required');
    }
    if (!client.kpClientLName?.trim()) {
        throw new Error('Last name is required');
    }
    // Add other validations as needed
  };

  const handleUpdateSubmit = async () => {
    if (!selectedClient?.kpClientId) {
        setUpdateMessage({ type: 'error', message: 'Invalid client ID' });
        return;
    }

    setUpdating(true);
    try {
      const response = await axios.put(
        `http://localhost:8080/api/clients/updateClient/${selectedClient.kpClientId}`,
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
            withCredentials: true // Ensure session cookies are sent
        }
    );
    

        setEditDialog(false);
        await fetchData(); // Refresh the table
        setUpdateMessage({ type: 'success', message: 'Client updated successfully' });
    } catch (error) {
        console.error('Update error:', error);
        setUpdateMessage({ 
            type: 'error', 
            message: error.response?.data || error.message || 'Failed to update client' 
        });
    } finally {
        setUpdating(false);
    }
  };

  const handleDeleteConfirm = (client) => {
    setSelectedClient(client);
    setDeleteDialog(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedClient?.kpClientId) {
        setUpdateMessage({ type: 'error', message: 'Invalid client ID' });
        return;
    }

    setDeleting(true);
    try {
      await axios.delete(
        `/api/clients/deleteClient/${selectedClient.kpClientId}`,
        { withCredentials: true }
    );
    
        setDeleteDialog(false);
        await fetchData(); // Refresh the table
        setUpdateMessage({ type: 'success', message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        setUpdateMessage({ 
            type: 'error', 
            message: error.response?.data || error.message || 'Failed to delete client' 
        });
    } finally {
        setDeleting(false);
    }
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

  return (
    <Box sx={{ p: 5, overflowX: "auto" }}>
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
        <FormControl sx={{ minWidth: 200 }}>
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

      <TableContainer component={Paper}>
        <Table size="small">
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
                <TableCell>{client.categoryRegistered || 'N/A'}</TableCell>
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

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
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
        <DialogActions>
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
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete client {selectedClient?.kpClientFName} {selectedClient?.kpClientLName}?
          </Typography>
        </DialogContent>
        <DialogActions>
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