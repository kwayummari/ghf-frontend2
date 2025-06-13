import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  Link as MuiLink,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Email as EmailIcon, ArrowBack as BackIcon } from "@mui/icons-material";
import { ROUTES } from "../../constants";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API call
        console.log("Password reset requested for:", values.email);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setSuccess(true);
      } catch (err) {
        setError("Failed to send reset email. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: 2,
        }}
      >
        <Card sx={{ maxWidth: 400, width: "100%" }}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", mb: 2, color: "success.main" }}
            >
              Email Sent!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We've sent password reset instructions to your email address.
              Please check your inbox and follow the link to reset your
              password.
            </Typography>
            <Button
              component={Link}
              to={ROUTES.LOGIN}
              variant="contained"
              startIcon={<BackIcon />}
              fullWidth
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Enter your email address and we'll send you instructions to reset
              your password
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              loading={loading}
              disabled={!formik.isValid}
              sx={{ mb: 2, height: 48 }}
            >
              Send Reset Instructions
            </LoadingButton>

            <Box sx={{ textAlign: "center" }}>
              <MuiLink
                component={Link}
                to={ROUTES.LOGIN}
                variant="body2"
                color="primary"
                sx={{ textDecoration: "none" }}
              >
                Back to Login
              </MuiLink>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPasswordPage;
