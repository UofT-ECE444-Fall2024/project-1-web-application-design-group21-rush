import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

// TODO: Youssef - Implement navigation bar here
const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">
          UofT Secondhand Hub
        </Typography>
        {/* TODO: Youssef - Add navigation items here */}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
