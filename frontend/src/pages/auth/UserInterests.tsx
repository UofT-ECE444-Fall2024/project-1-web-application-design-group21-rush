import React, { useState } from 'react';
import {
  Typography,
  Button,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Container
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import './Signup.css';

const interestsList = [
  'Books',
  'Clothes',
  'Laptops',
  'Furniture',
  'Electronics',
  'Sports Equipment',
  'Bikes',
  'Collectables',
  'Miscellaneous'
];

const UserInterests: React.FC = () => {
  const [interests, setInterests] = useState<string[]>([]);
  const [alertMsg, setAlertMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    displayName = '',
    email = '',
    password = '',
    location: userLocation = ''
  } = location.state || {};

  const interestClicked = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests((currentElements) => currentElements.filter((element) => element !== interest));
    } else {
      if (interests.length < 4) {
        setInterests((currentElements) => [...currentElements, interest]);
      } 
    }
  };


  const handleContinue = async () => {
    if (interests.length < 1) {
      setAlertMsg('Please select at least 1 interest.');
      setTimeout(() => {
        setAlertMsg('');
      }, 3000);
      return;
    }
    setAlertMsg('');
    setIsLoading(true);
    console.log('Selected interests:', interests);

    const interestsString = interests.join(',');

    try {
      const response = await authApi.preRegisterUser({
        username: displayName,
        email: email,
        password: password,
        location: userLocation,
        categories: interestsString,
      });
      console.log(response);
    } catch (error) {
      console.error('Error during pre-registration:', error);
      return; 
    }
    
    setIsLoading(false);
    navigate('/verifyEmail', { state: { email } });
  };

  return (
    <Grid container sx={{ height: '100vh' }}>
      <Grid item xs={12} md={6} sx={{
        backgroundImage: `url('/logobig.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        <Box className="animatedText" sx={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}>
          <Typography variant="h4" className="text1">Reuse</Typography>
          <Typography variant="h4" className="text2">Refresh</Typography>
          <Typography variant="h4" className="text3">Relove.</Typography>
        </Box>
      </Grid>
      
      <Grid item xs={12} md={6} sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4
      }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Stepper activeStep={1} alternativeLabel sx={{ mb: 3 }}>
            <Step key="Create Account">
              <StepLabel>Create Account</StepLabel>
            </Step>
            <Step key="Choose Interests">
              <StepLabel>Choose Interests</StepLabel>
            </Step>
            <Step key="Verify Email">
              <StepLabel>Verify Email</StepLabel>
            </Step>
          </Stepper>

          <Typography variant="h4" align="center" gutterBottom>
            Choose Your Interests
          </Typography>
          <Typography variant="subtitle1" align="center" gutterBottom sx={{ color: 'grey.600', mt: 2 }}> 
            Choose 1-4 interests
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'center',
              mt: 2
            }}
          >
            {interestsList.map((interest) => (
              <Button
                key={interest}
                variant={interests.includes(interest) ? 'contained' : 'outlined'}
                color={interests.includes(interest) ? 'primary' : undefined}
                onClick={() => interestClicked(interest)}
                disabled={interests.length >= 4 && !interests.includes(interest)}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                }}
              >
                {interest}
              </Button>
            ))}
          </Box>

          <Typography
            variant="body2"
            align="center"
            sx={{ color: 'grey.600', mt: 2 }}
          >
            {interests.length} selected
          </Typography>

          {alertMsg && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {alertMsg}
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 4 }}
            onClick={handleContinue}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};

export default UserInterests;
