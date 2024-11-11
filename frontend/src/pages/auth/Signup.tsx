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
  MenuItem
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';

const Signup: React.FC = () => {

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [alertMsg, setAlertMsg] = useState<string | JSX.Element>(''); //use this to give a alert message, For example, if the password or email is incorrect, just set use setAlertMsg and it will auto show up
  const [successMsg, setSuccessMsg] = useState(''); //To be used when sign up is successfull
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;//email format checker

  // Handle form submission
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => { //Uses the emailRegex to ensure that the email is in the correct format
    e.preventDefault();
    if (!emailRegex.test(email)) {
      setAlertMsg('Please enter a valid email address.');
      return;
    }
    if (location == '') {
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
    if (password.length < 8) { //checks for at least 8 charcters
      setAlertMsg('Password must be at least 8 characters long.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) { //checks for at least 1 special charcter
      setAlertMsg('Password must contain at least one special character (e.g., !, @, #).');
      return;
    }
    if (!/\d/.test(password)) { //checks for at least 1 number
      setAlertMsg('Password must contain at least one number.');
      return;
    }
    if (!/[a-zA-Z]/.test(password)) { // Check for at least one alphabetic character
      setAlertMsg('Password must contain at least one alphabetic character.');
      return;
    }
    setAlertMsg('');

    console.log('isLoading: ', isLoading);
    // can create a seperate react hook to show a loading symbol when this is true
    //setSuccessMsg('Success! Your account has been created.');

    const userInfo = { //use this for user creation
      displayName: displayName,
      email: email,
      password: password,
      location: location
    }

    console.log('Logging in with', userInfo.displayName, userInfo.email, userInfo.location); //---------------------------------- Need to set api call HERE instead ----------------------------------


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

    const response = await authApi.preRegisterUser({
      username: displayName,
      email: email,
      password: password,
      location: location,
    })
      .then(response => console.log(response))
      .catch(error => console.error(error));

    setIsLoading(false);

    navigate('/verifyEmail', { state: { email: email } });
    //navigate('/choose-interests-upon-signup');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
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
      </Paper>
    </Container>
  );
};

export default Signup;
