import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../../services/api';
import { Alert, Button, CircularProgress, Container, Typography } from '@mui/material';

const VerifyEmailButton = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [message, setMessage] = useState('');
    const { token } = useParams<{ token: string }>();
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        setIsLoading(true);
        try {
            const response = await authApi.verifyButton(token || '');
            console.log(response)
            if ('message' in response && response.message === "Email verified and account created successfully") {
                setMessage(response.message);
                setIsLoading(false);
                setTimeout(() => navigate('/login'), 2000);
            } else if ('error' in response) {
                setMessage(response.error || "Verification failed. Please try again.");
                setIsLoading(false);
                setTimeout(() => navigate('/signup'), 2000);
            }

        } catch (err) {
            setMessage("Verification failed. Please try again.");
            setIsLoading(false);
            setTimeout(() => navigate('/verifyEmail'), 2000);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Email Verification
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 3 }}>
                Click the button below to verify your account.
            </Typography>

            {message && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    {message}
                </Alert>
            )}

            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleVerify}
                disabled={isLoading || !token}
            >
                {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>
        </Container>
    );
};

export default VerifyEmailButton;
