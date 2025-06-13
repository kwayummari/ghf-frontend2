import React from "react";
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";

const PageLoader = ({
  open = true,
  message = "Loading...",
  transparent = false,
}) => {
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: transparent
          ? "rgba(0, 0, 0, 0.3)"
          : "rgba(0, 0, 0, 0.8)",
      }}
      open={open}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {message}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default PageLoader;
