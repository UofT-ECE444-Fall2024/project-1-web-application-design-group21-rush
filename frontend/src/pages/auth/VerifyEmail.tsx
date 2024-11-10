import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Alert } from '@mui/material';
import { authApi } from '../../services/api';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>(); // Get token from URL
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const verify = async () => {
//       if (token) {
//         const response = await authApi.verifyEmail(token);
//         if ('message' in response) {
//           setMessage(response.message); // Verification success message
//           setError(null);
//         } else {
//           setError(response.error); // Verification error message
//           setMessage(null);
//         }
//       }
//     };
//     verify();
//   }, [token]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
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
      </Paper>
    </Container>
  );
};

export default VerifyEmail;
