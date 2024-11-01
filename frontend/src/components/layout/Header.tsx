import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FaRegUserCircle } from "react-icons/fa";

// TODO: Youssef - Implement navigation bar here
const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const buttonStyle = {
    padding: '15px 12px',
    borderRadius: '10px',
    margin: '7px',
    cursor: 'pointer',
    fontSize: '17px',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    fontWeight: 'bold',
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
    navigate('/wishlist');
  };

  const goToProfile = () => {
    navigate('/productInfo');
  };

  const goToLogout = () => {
    setIsAuthenticated(!isAuthenticated);
    navigate('/');
  };


  return (
    <AppBar position="static">
      <Toolbar>
        <button onClick={goToHome}
          style={buttonStyle}>
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
            
            <FaRegUserCircle
              size={40}
              style={{ cursor: 'pointer' }}
              onClick={goToProfile}></FaRegUserCircle>
            
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
