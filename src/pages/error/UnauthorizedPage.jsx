import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Container, Alert } from "@mui/material";
import {
  Home as HomeIcon,
  ArrowBack as BackIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { ROUTES } from "../../constants";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <SecurityIcon
          sx={{
            fontSize: { xs: "6rem", md: "8rem" },
            color: "error.main",
            mb: 3,
          }}
        />

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "4rem", md: "6rem" },
            fontWeight: "bold",
            color: "error.main",
            mb: 2,
          }}
        >
          403
        </Typography>

        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
          Access Denied
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 500 }}
        >
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </Typography>

        <Alert severity="warning" sx={{ mb: 4, maxWidth: 500 }}>
          <Typography variant="body2">
            This page requires specific roles or permissions that your account
            doesn't have.
          </Typography>
        </Alert>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate(ROUTES.DASHBOARD)}
            size="large"
          >
            Go to Dashboard
          </Button>

          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
            size="large"
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
