import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Grid,
} from '@mui/material';
import { authApi } from '../../services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emailRegex.test(email)) {
      setAlertMsg('Please enter a valid email address.');
      return;
    }
    if (!email.includes('mail.utoronto.ca')) {
        setAlertMsg('Email should be a @mail.utoronto.ca address.');
        return;
      }

    setAlertMsg('');
    setIsLoading(true);

    const emailExists = await authApi.isEmailExisting(email);
    if (emailExists && 'exists' in emailExists && !emailExists.exists) {
        setAlertMsg('This email does not exist.');
        setIsLoading(false);
        setEmail('');
        return;
      }
      

    try {
        const response = await authApi.ForgotPassword( email );
        if (response) {
          setSuccessMsg('Password reset email sent! Please check your inbox.');
        } else {
          setAlertMsg('An error occurred. Please try again.');
        }
      } catch (error) {
        console.error('Forgot password error:', error);
        setAlertMsg('An error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
      

  

  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Forgot Password
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>
          Enter your email address to reset your password
        </Typography>

        {alertMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {alertMsg}
          </Alert>
        )}
        
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        <form onSubmit={handleForgotPassword}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
