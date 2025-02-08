import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export function Account() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    amsUserFname: "",
    amsUserLname: "",
    amsUsername: "",
    currentPassword: "",
    amsPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");

      if (!token || !username) {
        console.log("No token found, redirecting to login");
        navigate("/login");
        return;
      }

      if (!user?.id) {
        console.log("No user ID found");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8080/api/users/getUser/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Fetched user data:", response.data);
        const userData = response.data;

        setFormData((prev) => ({
          ...prev,
          amsUserFname: userData.amsUserFname || "",
          amsUserLname: userData.amsUserLname || "",
          amsUsername: userData.amsUsername || "",
          currentPassword: "",
          amsPassword: "",
          confirmPassword: "",
        }));
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 403) {
          console.log("Session expired or invalid token");
          navigate("/login");
        } else {
          setMessage({
            type: "error",
            text: error.response?.data?.message || "Failed to load user data",
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage({ type: "", text: "" });
  };

  const handleCancel = () => {
    // Reset form to original data
    setFormData({
      amsUserFname: user.amsUserFname,
      amsUserLname: user.amsUserLname,
      amsUsername: user.username,
      currentPassword: "",
      amsPassword: "",
      confirmPassword: "",
    });
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (!token || !username) {
      navigate("/login");
      return;
    }

    if (
      formData.amsPassword &&
      formData.amsPassword !== formData.confirmPassword
    ) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        amsUserFname: formData.amsUserFname,
        amsUserLname: formData.amsUserLname,
        amsUsername: formData.amsUsername,
        amsPassword: formData.amsPassword || undefined,
        currentPassword: formData.currentPassword,
      };

      await axios.put(
        `http://localhost:8080/api/users/updateUser/${user.id}`,
        updateData,
        {

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage({ type: "success", text: "Account updated successfully" });
      setIsEditing(false);

      // Update the user context with new data
      login({
        ...user,
        amsUsername: formData.amsUsername,
        amsUserFname: formData.amsUserFname,
        amsUserLname: formData.amsUserLname,
      });

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        amsPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update account",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        maxWidth: 600,
        mx: "auto",
        width: "100%",
      }}
    >
      <Paper
        sx={{
          p: { xs: 2, sm: 3 }, // Responsive padding
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" }, // Stack on mobile, row on desktop
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ mb: { xs: 1, sm: 0 } }}>
            Account Details
          </Typography>

          {!isEditing ? (
            <Button
              startIcon={<EditIcon />}
              onClick={handleEdit}
              variant="outlined"
              disabled={loading}
              fullWidth={isMobile} // Full width on mobile
            >
              Edit Profile
            </Button>
          ) : (
            <Stack
              direction={{ xs: "column", sm: "row" }} // Stack on mobile, row on desktop
              spacing={1}
              sx={{ width: { xs: "100%", sm: "auto" } }} // Full width on mobile
            >
              <Button
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                variant="outlined"
                color="error"
                fullWidth={isMobile}
              >
                Cancel
              </Button>
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                variant="contained"
                disabled={loading}
                fullWidth={isMobile}
              >
                {loading ? "Saving..." : "Save Changes"}
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
              size={isMobile ? "small" : "medium"}
            />

            <TextField
              label="Last Name"
              name="amsUserLname"
              value={formData.amsUserLname}
              onChange={handleChange}
              fullWidth
              disabled={!isEditing}
              size={isMobile ? "small" : "medium"}
            />

            <TextField
              label="Username"
              name="amsUsername"
              value={formData.amsUsername}
              onChange={handleChange}
              fullWidth
              disabled={!isEditing}
              size={isMobile ? "small" : "medium"}
            />

            {isEditing && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  }}
                >
                  Change Password (Optional)
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                  />

                  <TextField
                    label="New Password"
                    name="amsPassword"
                    type="password"
                    value={formData.amsPassword}
                    onChange={handleChange}
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                  />

                  <TextField
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                  />
                </Stack>
              </Box>
            )}
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
