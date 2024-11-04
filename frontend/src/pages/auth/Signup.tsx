import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  Alert 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alertMsg, setAlertMsg] = useState(''); //use this to give a alert message, For example, if the password or email is incorrect, just set use setAlertMsg and it will auto show up
  const [successMsg, setSuccessMsg] = useState(''); //To be used when sign up is successfull
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;//email format checker

  // Handle form submission
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => { //Uses the emailRegex to ensure that the email is in the correct format
    e.preventDefault();
    if (!emailRegex.test(email)) {
      setAlertMsg('Please enter a valid email address.');
      return; 
    }
    if (!email.includes('mail.utoronto.ca')) {
      setAlertMsg('Email must be a @mail.utoronto.ca address.');
      return;
    }
    if(password !== confirmPassword){
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
    setIsLoading(true); // can create a seperate react hook to show a loading symbol when this is true
    setSuccessMsg('Success! Your account has been created.');
    console.log('Logging in with', email, password); //---------------------------------- Need to set api call HERE instead ----------------------------------
    setIsLoading(false);

    setEmail('');
    setPassword('');
    setConfirmPassword('');

    navigate('/choose-interests-upon-signup');
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
                Login
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
