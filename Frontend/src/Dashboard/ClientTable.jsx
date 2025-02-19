import { useEffect, useState } from "react";
import { 
  Box, 
  IconButton, 
  CircularProgress, 
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
import { AutoSizer, Column, Table as VirtualizedTable } from 'react-virtualized';
import 'react-virtualized/styles.css'; // Import the styles

const ClientTable = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

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
        getCategories()
      ]);
  
      const clientsData = Array.isArray(clientsResponse.data) ? clientsResponse.data : [];
  
      const mergedClients = clientsData.map(client => {
        const category = categoriesResponse.find(cat => cat.id === client.categoryId);
        return {
          ...client,
          categoryName: category ? category.name : "Unknown"
        };
      });
  
      const validClients = mergedClients.filter(client =>
        client && client.kpClientId != null && client.kpClientSerialNumber != null
      );
  
      setClients(validClients);
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
        await fetchData();
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
        await fetchData();
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
        <Paper style={{ height: 600, width: '100%' }}>
          <AutoSizer>
            {({ height, width }) => (
              <VirtualizedTable
                width={width}
                height={height}
                headerHeight={48}
                rowHeight={48}
                rowCount={filteredClients.length}
                rowGetter={({ index }) => filteredClients[index]}
                rowStyle={{ display: 'flex', alignItems: 'center' }}
              >
                {/* <Column
                  label="ID"
                  dataKey="kpClientId"
                  width={100}
                  flexGrow={1}
                /> */}
                <Column
                  label="First Name"
                  dataKey="kpClientFName"
                  width={150}
                  flexGrow={1}
                />
                <Column
                  label="Last Name"
                  dataKey="kpClientLName"
                  width={150}
                  flexGrow={1}
                />
                <Column
                  label="Serial Number"
                  dataKey="kpClientSerialNumber"
                  width={150}
                  flexGrow={1}
                />
                {/* <Column
                  label="Time Assigned"
                  dataKey="kpClientTimeAssigned"
                  width={200}
                  flexGrow={1}
                  cellRenderer={({ cellData }) => (
                    cellData ? new Date(cellData).toLocaleString() : 'N/A'
                  )}
                /> */}
                <Column
                  label="Registered By"
                  dataKey="registeredByUsername"
                  width={150}
                  flexGrow={1}
                  cellRenderer={({ cellData, rowData }) => (
                    cellData || rowData.registeredBy || 'N/A'
                  )}
                />
                <Column
                  label="Category"
                  dataKey="categoryName"
                  width={250}
                  flexGrow={1}
                />
                <Column
                  label="Actions"
                  dataKey="actions"
                  width={120}
                  flexGrow={1}
                  cellRenderer={({ rowData }) => (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        onClick={() => handleUpdate(rowData)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={() => handleDeleteConfirm(rowData)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                />
              </VirtualizedTable>
            )}
          </AutoSizer>
        </Paper>
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