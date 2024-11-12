import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Box, Container, CircularProgress, TextField } from '@mui/material';
import { authApi } from '../services/api';
import { User } from '../types/user';
import { useNavigate } from 'react-router-dom';

const CenterImagePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profilePicSrc, setProfilePicSrc] = useState("https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/1084px-Unknown_person.jpg?20200423155822");
    const navigate = useNavigate();

    useEffect(() => {
        if (!username){
            navigate('/');
        }

        const fetchUser = async () => {
          try {
            setIsLoading(true);
            const response = await authApi.getUserInfo(username as string);
            if (response) {
                setUser(response as User);
            }
          } catch (error) {
            setUser(null);
          } finally {
            setIsLoading(false);
          };
        };
        fetchUser();
    }, [username]);

    if (isLoading) {
        return (
          <>
            <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Container>
          </>
        );
      }

    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Grid container spacing={2} style={{display: 'flex', flexDirection: 'column',alignItems: 'center', 
                justifyContent: 'center'}}>

                <Grid item xs={12} md={3} style={{ display: 'flex', gap: '10px', marginTop: '10px'}}>
                    <div style={{ textAlign: 'center' }}>
                        <img src={user?.profile_picture || profilePicSrc} style={{ width: '200px', height: '200px', borderRadius: '100px'}} />
                    </div>
                </Grid>
                
                <Grid item xs={12} md={6} style={{ display: 'flex', gap: '10px', flexDirection: 'column', marginTop: '10px'}}>
                    <TextField
                        fullWidth size="small"
                        label="Name"
                        variant="outlined"
                        value={user?.username || ''}
                        style={styles.label}
                        InputLabelProps={{ style: { fontWeight: 'bold'} }}
                        InputProps={{
                            style: styles.label,
                            readOnly: true,
                        }}
                    />
                    <TextField
                        fullWidth size="small"
                        label="Email"
                        variant="outlined"
                        value={user?.email || ''}
                        style={styles.label}
                        InputProps={{
                            style: styles.label,
                            readOnly: true, // Email should not be editable
                        }}
                    />
                    <TextField
                        fullWidth size="small"
                        label="Location"
                        variant="outlined"
                        value={user?.location || ''}
                        style={styles.label}
                        InputProps={{
                            style: styles.label,
                            readOnly: true, 
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

const styles = {
    infoBlock: {
      marginTop: '20px',
      padding: '20px',
      width: '80%',
      maxWidth: '400px',
      backgroundColor: '#ffffff',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      borderRadius: '10px',
      textAlign: 'center' as 'center',
    }as React.CSSProperties,
    profileInfo: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
    } as React.CSSProperties,
    name: {
        margin: '0',
        fontSize: '1.5em',
    } as React.CSSProperties,
    title: {
        fontSize: '1em',
        color: '#666',
    } as React.CSSProperties,
    form: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '400px',
        marginTop: '20px',
    } as React.CSSProperties,
    label: {
        marginBottom: '10px',
        alignItems: 'left',
        textAlign: 'left',
        color: '#000'
    } as React.CSSProperties,
    input: {
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        width: '100%',
        marginTop: '5px',
    } as React.CSSProperties,
    button: {
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        textAlign: 'center' as 'center',
    } as React.CSSProperties,
    bio: {
        fontSize: '1em',
        color: '#666',
    } as React.CSSProperties,
  };

export default CenterImagePage;
