/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import api from "../services/api";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { getCategories } from "../services/api";


export function FindClient() {
  const [serialNumber, setSerialNumber] = useState("");
  const [client, setClient] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState([]);

//   const getCategories = async () => {
//     try {
//       const response = await api.get("/api/categories");
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//       throw error;
//     }
// };

  useEffect(() => {
    // Fetch categories when component mounts
    // const fetchCategories = async () => {
     getCategories()
     .then(setCategories)
     .catch(error => setError("Error fetching categories: " + error.message));
  }, []);


  const handleSearch = async () => {
    if (!serialNumber) {
      setError("Please enter a serial number");
      return;
    }
  
    setLoading(true);
    setError("");
    setClient(null);
  
    try {
      const response = await api.get(`/api/clients/findClient/serial/${serialNumber}`);
      if (response.data) {
      const foundClient = response.data;
      const category = categories.find(c => c.id === foundClient.categoryId);
      foundClient.categoryName = category ? category.name : "Unknown";
      setClient(foundClient);
    } else {
      setError("No client found with this serial number");
    }
    } catch (error) {
      console.error("Search error:", error);
      if (error.response?.status === 403) {

        setError(localStorage.getItem("token") ? "Session expired. Log in again." : "Not authenticated. Please log in.");
      } else {
        setError(error.response?.data?.message || "Failed to find client");
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleUpdate = () => {
    setEditDialog(true);
  };

  const handleUpdateSubmit = async () => {
    if (!client?.kpClientId) {
      setError("Invalid client ID");
      return;
    }

    setUpdating(true);
    try {
      const response = await api.put(
        `/api/clients/updateClient/${client.kpClientId}`,
        {
          ...client,
          kpClientFName: client.kpClientFName.trim(),
          kpClientLName: client.kpClientLName.trim(),
        }
      );
      setEditDialog(false);
      setClient(response.data);
      setError("");
    } catch (error) {
      console.error("Update error:", error);
      setError(error.response?.data?.message || "Failed to update client");
    } finally {
      setUpdating(false);
    }
};

  const handleDeleteConfirm = () => {
    setDeleteDialog(true);
  };

  const handleDeleteSubmit = async () => {
    if (!client?.kpClientId) {
      setError("Invalid client ID");
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/api/clients/deleteClient/${client.kpClientId}`);
      setDeleteDialog(false);
      setClient(null);
      setError("");
    } catch (error) {
      console.error("Delete error:", error);
      setError(error.response?.data?.message || "Failed to delete client");
    } finally {
      setDeleting(false);
    }
};

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Find Client by Serial Number
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Serial Number"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleSearch} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Search"}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {client && (
          <TableContainer>
            <Table>
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
                <TableRow>
                  <TableCell>{client.kpClientId}</TableCell>
                  <TableCell>{client.kpClientFName}</TableCell>
                  <TableCell>{client.kpClientLName}</TableCell>
                  <TableCell>{client.kpClientSerialNumber}</TableCell>
                  <TableCell>
                    {client.kpClientTimeAssigned
                      ? new Date(client.kpClientTimeAssigned).toLocaleString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {client.registeredByUsername ||
                      client.registeredBy ||
                      "N/A"}
                  </TableCell>
                  <TableCell>{client.categoryName|| "N/A"}</TableCell>
                  <TableCell>
                    <IconButton onClick={handleUpdate} sx={{ mr: 1 }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={handleDeleteConfirm}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Edit Client</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="First Name"
              value={client?.kpClientFName || ""}
              onChange={(e) =>
                setClient({
                  ...client,
                  kpClientFName: e.target.value,
                })
              }
              fullWidth
            />
            <TextField
              label="Last Name"
              value={client?.kpClientLName || ""}
              onChange={(e) =>
                setClient({
                  ...client,
                  kpClientLName: e.target.value,
                })
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={client?.categoryRegistered || ""}
                label="Category"
                onChange={(e) =>
                  setClient({
                    ...client,
                    categoryRegistered: e.target.value,
                  })
                }
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
            {updating ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete client {client?.kpClientFName}{" "}
            {client?.kpClientLName}?
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
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
