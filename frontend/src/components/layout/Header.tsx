import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// TODO: Youssef - Implement navigation bar here
const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    margin: '10px',
    cursor: 'pointer'
  };

  const goToLogin = () => {
    setIsAuthenticated(!isAuthenticated);
    navigate('/login');
  };

  const goToSignUp = () => {
    navigate('/signup');
  };

  const goToHome = () => {
    navigate('/'); 
  };

  const goToWishlist = () => {
    navigate('/'); 
  };

  const goToProfile = () => {
    navigate('/'); 
  };

  const goToLogout = () => {
    setIsAuthenticated(!isAuthenticated);
    navigate('/'); 
  };


  return (
    <AppBar position="static">
      <Toolbar>
        <button onClick={goToHome}>
          {/* style={{backgroundColor:'#001F3F'}}> */}
          <Typography variant="h6"> 
            UofT Secondhand Hub
          </Typography>
        </button>


        <Box sx={{ flexGrow: 1 }} />

        {isAuthenticated ? (
          <>
            <button 
              style={buttonStyle}
              onClick={goToSignUp}>Signup</button>
            
            <button 
              style={buttonStyle}
              onClick={goToLogin}>Login</button>
          </>
        ) : (
          <>
            <button 
                style={buttonStyle}
                onClick={goToWishlist}>Wishlist</button>
            
            <button 
              style={buttonStyle}
              onClick={goToProfile}>Profile</button>
            
            <button 
              style={buttonStyle}
              onClick={goToLogout}>Logout</button>
          </>
        )}

      </Toolbar>
    </AppBar>
  );
};

export default Header;
