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

const Login: React.FC = () => {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertMsg, setAlertMsg] = useState(''); //use this to give a alert message, For example, if the password or email is incorrect, just set use setAlertMsg and it will auto show up
  const [isLoading, setIsLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;//email format checker

  // Handle form submission
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => { //Uses the emailRegex to ensure that the email is in the correct format
    e.preventDefault();
    if (!emailRegex.test(email)) {
      setAlertMsg('Please enter a valid email address.');
      return; 
    }
    setAlertMsg('');
    setIsLoading(true); // can create a seperate react hook to show a loading symbol when this is true
    console.log('Logging in with', email, password); //Need to set api call HERE instead
    setIsLoading(false);

  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          UofT Secondhand Hub
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>
          Sign in to your account
        </Typography>

        {alertMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {alertMsg}
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
          Don’t have an account? <a href="/signup">Sign up</a>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Login;
