import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Container } from "@mui/material";
import { Home as HomeIcon, ArrowBack as BackIcon } from "@mui/icons-material";
import { ROUTES } from "../../constants";

const NotFoundPage = () => {
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
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "8rem", md: "12rem" },
            fontWeight: "bold",
            color: "primary.main",
            mb: 2,
          }}
        >
          404
        </Typography>

        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
          Page Not Found
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 500 }}
        >
          The page you're looking for doesn't exist or has been moved. Please
          check the URL or navigate back to the homepage.
        </Typography>

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

export default NotFoundPage;
