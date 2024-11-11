import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FaRegUserCircle } from "react-icons/fa";
import { useAuth } from '../../context/AuthContext'; 
import logo from './logo.png';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); 

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const buttonStyle = {
    textTransform: 'none',
    marginRight: 2,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Button 
          onClick={() => handleNavigation('/')} 
          sx={{ 
            textTransform: 'none',
            padding: '8px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <img 
            src={logo} 
            alt="UofT Secondhand Hub Logo" 
            style={{ 
              height: '60px',
              width: 'auto',
              borderRadius: '50%',
              border: '2px solid white',
            }} 
          />
        </Button>

        <Box sx={{ flexGrow: 1.5 }} />
        
        <Typography 
          variant="h5" 
          sx={{ 
            flexGrow: 1,
            textAlign: 'center',
            fontWeight: 'bold',
            color: 'white'
          }}
        >
          UofT Secondhand Hub
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {!isAuthenticated ? (
          <>
            <Button 
              onClick={() => handleNavigation('/signup')}
              sx={buttonStyle}
            >
              Signup
            </Button>
            
            <Button 
              onClick={() => handleNavigation('/login')}
              sx={buttonStyle}
            >
              Login
            </Button>
          </>
        ) : (
          <>
            <Button 
              onClick={() => handleNavigation('/recommended')}
              sx={buttonStyle}
            >
              Recommended
            </Button>

            <Button 
              onClick={() => handleNavigation('/wishlist')}
              sx={buttonStyle}
            >
              Wishlist
            </Button>

            <Button 
              onClick={() => handleNavigation('/create-listing')}
              sx={buttonStyle}
            >
              Create Listing
            </Button>
            
            <FaRegUserCircle
              size={40}
              style={{ cursor: 'pointer', marginRight: 16, color: 'white' }}
              onClick={() => handleNavigation('/profile-view')}
            />
            
            <Button 
              onClick={() => handleNavigation('/')}
              sx={buttonStyle}
            >
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
