import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingSpinner = ({
  size = 40,
  message = "Loading...",
  centered = true,
  fullHeight = false,
  color = "primary",
}) => {
  const content = (
    <>
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </>
  );

  if (centered) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: fullHeight ? "100vh" : 200,
          textAlign: "center",
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>{content}</Box>
  );
};

export default LoadingSpinner;
