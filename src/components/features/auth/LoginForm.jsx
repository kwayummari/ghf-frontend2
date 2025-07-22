import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Typography,
  Card,
  CardContent,
  Alert,
  Divider,
  Link as MuiLink,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import {
  loginUser,
  selectLoginLoading,
  selectAuthError,
} from "../../../store/slices/authSlice";
import { AUTH_CONSTANTS, ROUTES } from "../../../constants";

const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  maxWidth: 900,
  width: "100%",
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
  },
}));

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectLoginLoading);
  const error = useSelector(selectAuthError);
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const resultAction = await dispatch(loginUser(values));
        if (loginUser.fulfilled.match(resultAction)) {
          navigate(AUTH_CONSTANTS.LOGIN_REDIRECT, { replace: true });
        }
      } catch (error) {
        console.error("Login error:", error);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f4f4f4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Box sx={{ textAlign: "center", mb: 4, position: "absolute", top: 20 }}>
        <img src="/assets/images/logo.png" alt="GHF Logo" style={{ height: 80 }} />
      </Box>

      <StyledCard>
        <Box
          sx={{
            width: "50%",
            bgcolor: "#fff",
            display: { xs: "none", sm: "block" },
          }}
        >
          <img
            src="/assets/images/ghf01.png"
            alt="GHF Background"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>

        <Box sx={{ flex: 1, p: 4, bgcolor: "#fff" }}>
          <CardContent>
            <Typography
              variant="h5"
              sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}
            >
              GHF Login
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

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
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !formik.isValid}
                startIcon={<LoginIcon />}
                sx={{
                  height: 48,
                  fontWeight: "bold",
                  backgroundColor: "#007bff",
                }}
              >
                {loading ? "Signing In..." : "Login"}
              </Button>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  or
                </Typography>
              </Divider>

              <Box sx={{ textAlign: "center" }}>
                <MuiLink
                  component={Link}
                  to={ROUTES.FORGOT_PASSWORD}
                  variant="body2"
                  color="primary"
                  sx={{ textDecoration: "none" }}
                >
                  Forgot your password?
                </MuiLink>
              </Box>
            </Box>
          </CardContent>
        </Box>
      </StyledCard>
    </Box>
  );
};

export default LoginPage;
