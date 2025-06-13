import React from "react";
import { Box, Typography, Link, Divider } from "@mui/material";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        mt: "auto",
        borderTop: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "center", sm: "center" },
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {currentYear} GH Foundation. All rights reserved.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Link
            href="mailto:info@ghf.org"
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: "none" }}
          >
            Support
          </Link>
          <Divider orientation="vertical" flexItem />
          <Typography variant="body2" color="text.secondary">
            Version 1.0.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
