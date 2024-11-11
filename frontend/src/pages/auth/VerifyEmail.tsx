import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, Alert, Button, Box, TextField } from '@mui/material';
import { authApi } from '../../services/api';

interface LocationState {
  email?: string;
}

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { email = '' } = (location.state as LocationState) || {}; // Retrieve email from state with fallback
  const [message, setMessage] = useState<string | null>('A verification link has been sent to your email.');
  const [error, setError] = useState<string | null>(null);
  const [resendDisabled, setResendDisabled] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(10);

  // Redirect if email is missing
  useEffect(() => { //this shouldnt be possible
    if (!email) {
      setError('Email not provided. Redirecting...');
      setTimeout(() => navigate('/signup'), 3000); // Redirect after 3 seconds
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendDisabled) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 10;
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

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
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
    </Container>
  );
};

export default VerifyEmail;
