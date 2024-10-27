import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          UofT Secondhand Hub
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Navigation items will be added by Youssef */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
