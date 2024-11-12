import { Alert, Button, Container, Grid, Paper, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../../services/api';

const ChangePassword: React.FC = () => {

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
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

    if (newPassword.length < 8) {
        setAlertMsg('Password must be at least 8 characters long.');
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        setAlertMsg('Password must contain at least one special character (e.g., !, @, #).');
        return;
      }
      if (!/\d/.test(newPassword)) {
        setAlertMsg('Password must contain at least one number.');
        return;
      }
      if (!/[a-zA-Z]/.test(newPassword)) {
        setAlertMsg('Password must contain at least one alphabetic character.');
        return;
      }

    setIsLoading(true);
    setAlertMsg('');
    try {

        const response = await authApi.ChangePassword(oldPassword, newPassword);

        if ('message' in response) {
          setSuccessMsg('Password reset successfully! Redirecting...');
          setTimeout(() => navigate('/profile-view'), 2000); // Redirect to login page after 2 seconds
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
                label="Old Password"
                variant="outlined"
                type="password"
                fullWidth
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </Grid>
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

export default ChangePassword;
