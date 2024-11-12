import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Box
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import './Signup.css';

const Signup: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');

  const [alertMsg, setAlertMsg] = useState<string | JSX.Element>('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validation and signup logic here...
  };

  return (
    <Grid container sx={{ height: '100vh' }}>
      {/* Left side with background image and animated text */}
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
          <Stepper activeStep={0} alternativeLabel sx={{ mb: 3 }}>
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
            UofT Secondhand Hub
          </Typography>
          <Typography variant="subtitle1" align="center" gutterBottom>
            Create new account
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

          <form onSubmit={handleLogin}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Display Name"
                  variant="outlined"
                  fullWidth
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={location}
                    onChange={(e) => setLocation(e.target.value as string)}
                    label="Location"
                  >
                    <MenuItem value="St. George">St. George</MenuItem>
                    <MenuItem value="Mississauga">Mississauga</MenuItem>
                    <MenuItem value="Scarborough">Scarborough</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
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
                <TextField
                  label="Password"
                  variant="outlined"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Confirm Password"
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
                >
                  {isLoading ? 'Creating account...' : 'Create new account'}
                </Button>
              </Grid>
            </Grid>
          </form>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account? <a href="/login">Sign In</a>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Signup;