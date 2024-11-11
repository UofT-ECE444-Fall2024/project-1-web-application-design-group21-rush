import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Typography,
  Alert,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Box,
  Grid
} from '@mui/material';
import { authApi } from '../../services/api';

interface LocationState {
  email?: string;
}

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { email = '' } = (location.state as LocationState) || {};
  const [message, setMessage] = useState<string | null>('A verification link has been sent to your email.');
  const [error, setError] = useState<string | null>(null);
  const [resendDisabled, setResendDisabled] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(60);

  // Redirect if email is missing
  useEffect(() => {
    if (!email) {
      setError('Email not provided. Redirecting...');
      setTimeout(() => navigate('/signup'), 3000);
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendDisabled) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);

            return 60;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendDisabled]);

  const handleResend = async () => {
    setMessage('A new verification link has been sent to your email.');
    setResendDisabled(true);
    setCountdown(60);

    try {
      const response = await authApi.resendVerification(email);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  // were polling for email in the database
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const emailExists = await authApi.isEmailExisting(email);
        if (emailExists && 'exists' in emailExists && emailExists.exists) {
          clearInterval(intervalId);
          navigate('/login', { 
            state: { 
              email, 
              message: 'You have successfully created your account.' 
            } 
          });
        }
      } catch (error) {
        console.error('Error checking email existence:', error);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [email, navigate]);

  return (
    <Grid container sx={{ height: '100vh' }}>
      <Grid item xs={12} md={6} sx={{
        backgroundImage: `url('/logobig.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />

      <Grid item xs={12} md={6} sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4
      }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Stepper activeStep={2} alternativeLabel sx={{ mb: 3 }}>
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
            Email Verification
          </Typography>

          {message && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {email && (
            <TextField
              label="Email"
              value={email}
              variant="outlined"
              fullWidth
              disabled
              sx={{ mt: 3 }}
            />
          )}
          <Button
            variant="contained"
            onClick={handleResend}
            disabled={resendDisabled}
            sx={{ mt: 3 }}
          >
            Resend Verification Link {resendDisabled && `(${countdown}s)`}
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};

export default VerifyEmail;
