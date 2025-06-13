import React from "react";
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { NavigateNext as NavigateNextIcon } from "@mui/icons-material";

const Breadcrumbs = ({ customBreadcrumbs = [] }) => {
  const location = useLocation();

  const generateBreadcrumbs = () => {
    if (customBreadcrumbs.length > 0) {
      return customBreadcrumbs;
    }

    const pathnames = location.pathname.split("/").filter(Boolean);
    return pathnames.map((pathname, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
      const isLast = index === pathnames.length - 1;

      return {
        label:
          pathname.charAt(0).toUpperCase() +
          pathname.slice(1).replace("-", " "),
        path: routeTo,
        isLast,
      };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
      <Link component={RouterLink} to="/" color="inherit">
        Home
      </Link>
      {breadcrumbs.map((crumb) =>
        crumb.isLast ? (
          <Typography key={crumb.path} color="text.primary">
            {crumb.label}
          </Typography>
        ) : (
          <Link
            key={crumb.path}
            component={RouterLink}
            to={crumb.path}
            color="inherit"
          >
            {crumb.label}
          </Link>
        )
      )}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs;
