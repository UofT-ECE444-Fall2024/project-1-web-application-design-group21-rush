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
    if (!emailRegex.test(email)) {
      setAlertMsg('Please enter a valid email address.');
      return;
    }

    if (location === '') {
      setAlertMsg('Please select a location');
      return;
    }
    if (!email.includes('mail.utoronto.ca')) {
      setAlertMsg('Email must be a @mail.utoronto.ca address.');
      return;
    }
    if (password !== confirmPassword) {
      setAlertMsg('Passwords must match');
      return;
    }

    if (password.length < 8) {
      setAlertMsg('Password must be at least 8 characters long.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setAlertMsg('Password must contain at least one special character (e.g., !, @, #).');
      return;
    }
    if (!/\d/.test(password)) {
      setAlertMsg('Password must contain at least one number.');
      return;
    }
    if (!/[a-zA-Z]/.test(password)) {
      setAlertMsg('Password must contain at least one alphabetic character.');
      return;
    }
    setAlertMsg('');


    const userInfo = {
      displayName: displayName,
      email: email,
      password: password,
      location: location

    };

    setIsLoading(true);

    // Check if username exists
    const usernameExistsResponse = await authApi.isUsernameExisting(displayName);
    if (usernameExistsResponse && 'exists' in usernameExistsResponse && usernameExistsResponse.exists) {
      setAlertMsg(
        <span>This username is already taken. Maybe try <Link to="/login">signing in</Link>?</span>
      );
      setIsLoading(false);
      setDisplayName('');
      return;
    }


    // Check if email exists
    const emailExists = await authApi.isEmailExisting(email);
    if (emailExists && 'exists' in emailExists && emailExists.exists) {
      setAlertMsg(
        <span>This email is already taken. Maybe try <Link to="/login">signing in</Link>?</span>
      );
      setIsLoading(false);
      setEmail('');
      return;
    }


    // Move to the next page for choosing interests
    navigate('/choose-interests-upon-signup', { 
      state: { 
        displayName: displayName,
        email: email,
        password: password,
        location: location
      } 
    });
  };

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
