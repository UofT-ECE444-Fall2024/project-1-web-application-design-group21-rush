import { Alert, Button, Container, Grid, Paper, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../../services/api';

const ResetPassword: React.FC = () => {

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('error');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const location = useLocation();
  const fullUrl = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;
  const { token } = useParams<{ token: string }>();
  
  const handleSubmit = async (e: React.FormEvent) => {
    setSuccessMsg('');
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setAlertMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setAlertMsg('');
    try {

        const response = await authApi.resetPassword(token || '', newPassword);

        if ('message' in response) {
          setSuccessMsg('Password reset successfully! Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000); // Redirect to login page after 2 seconds
        } else {
          setAlertMsg(response.error || 'An error occurred. Please try again.');
        }
    } catch (error) {
        setAlertMsg('An unexpected error occurred. Please try again.');
        setAlertSeverity('error');
    } finally {
    setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Reset Password
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

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="New Password"
                variant="outlined"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Confirm New Password"
                variant="outlined"
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ResetPassword;
