import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Button,
  Tabs,
  Tab,
  TextField,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, updateUserProfile } from "../../store/slices/authSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import useNotification from "../../hooks/common/useNotification";

// Validation schemas
const profileSchema = Yup.object({
  first_name: Yup.string().required("First name is required"),
  middle_name: Yup.string(),
  sur_name: Yup.string().required("Surname is required"),
  phone: Yup.string(),
  date_of_birth: Yup.date(),
});

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Profile form
  const profileFormik = useFormik({
    initialValues: {
      first_name: user?.first_name || "",
      middle_name: user?.middle_name || "",
      sur_name: user?.sur_name || "",
      phone: user?.phone || "",
      date_of_birth: user?.date_of_birth?.split("T")[0] || "",
    },
    validationSchema: profileSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await dispatch(updateUserProfile(values)).unwrap();
        showSuccess("Profile updated successfully");
        setEditMode(false);
      } catch (error) {
        showError(error || "Failed to update profile");
      } finally {
        setLoading(false);
      }
    },
  });

  // Password form
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: passwordSchema,
    onSubmit: async (values, { resetForm }) => {
      setPasswordLoading(true);
      try {
        // Simulate API call - replace with actual password change API
        console.log("Changing password for user:", user.id);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        showSuccess("Password changed successfully");
        resetForm();
      } catch (error) {
        showError("Failed to change password. Please try again.");
      } finally {
        setPasswordLoading(false);
      }
    },
  });

  const handleCancelEdit = () => {
    profileFormik.resetForm();
    setEditMode(false);
  };

  const getUserDisplayName = () => {
    const firstName = user?.first_name || "";
    const surname = user?.sur_name || "";
    return firstName && surname
      ? `${firstName} ${surname}`
      : user?.email || "User";
  };

  const getUserInitials = () => {
    const firstName = user?.first_name || "";
    const surname = user?.sur_name || "";

    if (firstName && surname) {
      return `${firstName.charAt(0)}${surname.charAt(0)}`.toUpperCase();
    }

    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "U";
  };

  const getUserRole = () => {
    if (!user?.roles || user.roles.length === 0) {
      return "Employee";
    }

    const role = user.roles[0];
    return typeof role === "string" ? role : role.role_name || "Employee";
  };

  const tabPanels = [
    {
      label: "Personal Info",
      content: (
        <Box component="form" onSubmit={profileFormik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="first_name"
                label="First Name"
                value={profileFormik.values.first_name}
                onChange={profileFormik.handleChange}
                onBlur={profileFormik.handleBlur}
                error={
                  profileFormik.touched.first_name &&
                  Boolean(profileFormik.errors.first_name)
                }
                helperText={
                  profileFormik.touched.first_name &&
                  profileFormik.errors.first_name
                }
                disabled={!editMode}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                name="middle_name"
                label="Middle Name"
                value={profileFormik.values.middle_name}
                onChange={profileFormik.handleChange}
                onBlur={profileFormik.handleBlur}
                error={
                  profileFormik.touched.middle_name &&
                  Boolean(profileFormik.errors.middle_name)
                }
                helperText={
                  profileFormik.touched.middle_name &&
                  profileFormik.errors.middle_name
                }
                disabled={!editMode}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                name="sur_name"
                label="Surname"
                value={profileFormik.values.sur_name}
                onChange={profileFormik.handleChange}
                onBlur={profileFormik.handleBlur}
                error={
                  profileFormik.touched.sur_name &&
                  Boolean(profileFormik.errors.sur_name)
                }
                helperText={
                  profileFormik.touched.sur_name &&
                  profileFormik.errors.sur_name
                }
                disabled={!editMode}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={user?.email || ""}
                disabled
                sx={{ mb: 2 }}
                helperText="Email cannot be changed"
              />
              <TextField
                fullWidth
                name="phone"
                label="Phone"
                value={profileFormik.values.phone}
                onChange={profileFormik.handleChange}
                onBlur={profileFormik.handleBlur}
                error={
                  profileFormik.touched.phone &&
                  Boolean(profileFormik.errors.phone)
                }
                helperText={
                  profileFormik.touched.phone && profileFormik.errors.phone
                }
                disabled={!editMode}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                name="date_of_birth"
                label="Date of Birth"
                type="date"
                value={profileFormik.values.date_of_birth}
                onChange={profileFormik.handleChange}
                onBlur={profileFormik.handleBlur}
                error={
                  profileFormik.touched.date_of_birth &&
                  Boolean(profileFormik.errors.date_of_birth)
                }
                helperText={
                  profileFormik.touched.date_of_birth &&
                  profileFormik.errors.date_of_birth
                }
                disabled={!editMode}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>

          {editMode && (
            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                loading={loading}
                disabled={!profileFormik.isValid}
              >
                Save Changes
              </LoadingButton>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      ),
    },
    {
      label: "Work Info",
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemText
                  primary="Department"
                  secondary={user?.department || "Not assigned"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Position"
                  secondary={user?.position || "Not assigned"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Employee ID"
                  secondary={user?.id || "N/A"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Hire Date"
                  secondary={
                    user?.hire_date
                      ? new Date(user.hire_date).toLocaleDateString()
                      : "N/A"
                  }
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemText
                  primary="Status"
                  secondary={
                    <Chip
                      label={user?.status || "Active"}
                      color="success"
                      size="small"
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Role" secondary={getUserRole()} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Supervisor"
                  secondary={user?.supervisor || "Not assigned"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Office Location"
                  secondary={user?.office_location || "Main Office"}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      ),
    },
    {
      label: "Security",
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Change Password
          </Typography>

          <Box component="form" onSubmit={passwordFormik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="password"
                  name="currentPassword"
                  label="Current Password"
                  value={passwordFormik.values.currentPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={
                    passwordFormik.touched.currentPassword &&
                    Boolean(passwordFormik.errors.currentPassword)
                  }
                  helperText={
                    passwordFormik.touched.currentPassword &&
                    passwordFormik.errors.currentPassword
                  }
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  type="password"
                  name="newPassword"
                  label="New Password"
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={
                    passwordFormik.touched.newPassword &&
                    Boolean(passwordFormik.errors.newPassword)
                  }
                  helperText={
                    passwordFormik.touched.newPassword &&
                    passwordFormik.errors.newPassword
                  }
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  type="password"
                  name="confirmPassword"
                  label="Confirm New Password"
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={
                    passwordFormik.touched.confirmPassword &&
                    Boolean(passwordFormik.errors.confirmPassword)
                  }
                  helperText={
                    passwordFormik.touched.confirmPassword &&
                    passwordFormik.errors.confirmPassword
                  }
                  sx={{ mb: 3 }}
                />

                <LoadingButton
                  type="submit"
                  variant="contained"
                  startIcon={<LockIcon />}
                  loading={passwordLoading}
                  disabled={!passwordFormik.isValid}
                >
                  Change Password
                </LoadingButton>
              </Grid>

              <Grid item xs={12} md={6}>
                <Alert severity="info">
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Password Requirements:</strong>
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    <Typography component="li" variant="body2">
                      At least 6 characters long
                    </Typography>
                    <Typography component="li" variant="body2">
                      Include both letters and numbers
                    </Typography>
                    <Typography component="li" variant="body2">
                      Avoid common passwords
                    </Typography>
                    <Typography component="li" variant="body2">
                      Don't reuse recent passwords
                    </Typography>
                  </Box>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal information and account settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: "primary.main",
                  fontSize: "3rem",
                  mx: "auto",
                  mb: 2,
                }}
              >
                {getUserInitials()}
              </Avatar>

              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                {getUserDisplayName()}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {user?.position || "Employee"}
              </Typography>

              <Chip
                label={getUserRole()}
                color="primary"
                variant="outlined"
                sx={{ mb: 3 }}
              />

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ textAlign: "left" }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Contact Information
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  📧 {user?.email}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  📱 {user?.phone || "Not provided"}
                </Typography>

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Employment Details
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  🏢 {user?.department || "Not assigned"}
                </Typography>
                <Typography variant="body2">
                  📅 Joined{" "}
                  {user?.hire_date
                    ? new Date(user.hire_date).toLocaleDateString()
                    : "N/A"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {/* Tab Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 3,
                  pb: 0,
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                >
                  {tabPanels.map((tab, index) => (
                    <Tab key={index} label={tab.label} />
                  ))}
                </Tabs>

                {activeTab === 0 && !editMode && (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>

              <Divider />

              {/* Tab Content */}
              <Box sx={{ p: 3 }}>{tabPanels[activeTab]?.content}</Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
