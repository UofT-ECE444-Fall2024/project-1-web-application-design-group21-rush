import React, { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Box, Container, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, TextField, Paper, Typography } from '@mui/material';

import { authApi } from '../services/api';
import { User } from '../types/user';
import { listingsApi } from '../services/api';
import ListingCard from '../components/listings/ListingCard';
import { Listing } from '../types/listing';

const ProfileView: React.FC = () => {
    const categories = ['Sports Equipment', 'Books', 'Clothes', 'Laptops', 'Electronics', 'Furniture', 'Bikes', 'Collectables', 'Miscellaneous'];
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editedUser, setEditedUser] = useState(user);
    const [alertMsg, setAlertMsg] = useState<string | JSX.Element>('');
    const [profilePicSrc, setProfilePicSrc] = useState("https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/1084px-Unknown_person.jpg?20200423155822");
    const [editState, setEditState] = useState(false);
    const [newImage, setNewImage] = useState<File | null>(null);

    const navigate = useNavigate();
    const [userListings, setUserListings] = useState<Listing[]>([]);
    const [isListingsLoading, setIsListingsLoading] = useState(false);
    const [listingsError, setListingsError] = useState<string | null>(null);


    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true);
                const response = await authApi.getCurrentUserInfo();
                if (response) {
                    setUser(response as User);
                    setEditedUser(response);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            };
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchUserListings = async () => {
          if (!user?.id) return;

          setIsListingsLoading(true);
          try {
            console.log('Fetching listings for user ID:', user.id); // Debug log
            const listings = await listingsApi.getListingsByUser(user.id);
            console.log('Fetched listings:', listings); // Debug log
            setUserListings(listings);
          } catch (error) {
            console.error('Error in fetchUserListings:', error);
            setListingsError('Unable to load listings at this time');
          } finally {
            setIsListingsLoading(false);
          }
        };

        if (user?.id) {
          fetchUserListings();
        }
    }, [user?.id]);

    const handleCategoryChange = (category: string) => {
        if (editedUser) {
            const currentCategories = editedUser.categories || [];
            let newCategories: string[];

            if (currentCategories.includes(category)) {
                // Remove category if already selected
                newCategories = currentCategories.filter((item) => item !== category);
            } else if (currentCategories.length < 4) {
                // Add category if not selected and less than 4 selected
                newCategories = [...currentCategories, category];
            } else {
                return; // Don't change state if already 4 selected
            }

            setEditedUser({
                ...editedUser,
                categories: newCategories
            });
        }
    };

    const handleEditRequest = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if (editedUser) {
            setEditedUser({
                ...editedUser,
                [field]: event.target.value
            });
        }
    };

    const handleProfilePic = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setNewImage(file);
            // Create preview URL for immediate display
            const url = URL.createObjectURL(file);
            if (editedUser) {
                setEditedUser({
                    ...editedUser,
                    profile_picture: url
                });
                setProfilePicSrc(URL.createObjectURL(file));
            }
        }
    };

    const handleSave = () => {
        if (editedUser && user) {
            const formData = new FormData();
            // Add each field to formData, rename reserved keywords
            formData.append('location', editedUser.location);
            formData.append('categories', JSON.stringify(editedUser.categories || []));

            if (newImage) {
                formData.append('profile_picture', URL.createObjectURL(newImage));
                formData.append('file', newImage);
            }

            authApi.editUser(formData);
            setUser(editedUser);
            setEditState(false);


        }
    };
    const handleChangePassword = () => {
        navigate('/change-password');
    }
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
            <Container maxWidth="lg">
              <Box sx={{ flexGrow: 1, padding: 2 }}>
                <Grid container spacing={2} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center'
                }}>
          
                  <Grid item xs={12} md={3} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <img src={editedUser?.profile_picture || profilePicSrc} style={{ width: '200px', height: '200px', borderRadius: '100px' }} />
                    </div>
                  </Grid>
          
                  {editState ? (
                    <input
                      type="file"
                      multiple
                      onChange={handleProfilePic}
                      accept=".jpg,.jpeg,.png"
                    />
                  ) : null}
          
                  <Grid item xs={12} md={6} style={{ display: 'flex', gap: '10px', flexDirection: 'column', marginTop: '10px' }}>
                    {alertMsg && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {alertMsg}
                      </Alert>
                    )}
                    <TextField
                      fullWidth size="small"
                      label="Name"
                      variant="outlined"
                      value={editedUser?.username || ''}
                      style={styles.label}
                      InputLabelProps={{ style: { fontWeight: 'bold' } }}
                      InputProps={{
                        style: styles.label,
                        readOnly: true,
                      }}
                    />
                    <TextField
                      fullWidth size="small"
                      label="Email"
                      variant="outlined"
                      value={editedUser?.email || ''}
                      style={styles.label}
                      InputProps={{
                        style: styles.label,
                        readOnly: true,
                      }}
                    />
                    <FormControl fullWidth size="small" disabled={!editState}>
                      <InputLabel style={{ fontWeight: 'bold' }}>Location</InputLabel>
                      <Select
                        style={styles.label}
                        value={editedUser?.location || ''}
                        onChange={(event) => {
                          if (editedUser) {
                            setEditedUser({
                              ...editedUser,
                              location: event.target.value as string
                            });
                          }
                        }}
                        inputProps={{
                          style: styles.label,
                          readOnly: !editState,
                        }}>
                        <MenuItem value="St. George">St. George</MenuItem>
                        <MenuItem value="Mississauga">Mississauga</MenuItem>
                        <MenuItem value="Scarborough">Scarborough</MenuItem>
                      </Select>
                    </FormControl>
                    <button
                      onClick={handleChangePassword}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#f5f5f5',
                        color: '#d32f2f',
                        border: '1px solid #808080',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    >
                      Change Password
                    </button>
                    <div>
                      <h5 style={styles.label}>Categories (up to 4):</h5>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {categories.map((category) => (
                          <div key={category} style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              onChange={() => handleCategoryChange(category)}
                              checked={editedUser?.categories?.includes(category)}
                              disabled={!editState}
                            />
                            <label style={{ marginLeft: '5px' }}>{category}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Grid>
          
                  {editState ? (
                    <button type="submit" style={styles.button} onClick={handleSave}>
                      Save Changes
                    </button>
                  ) : (
                    <button type="submit" style={styles.button} onClick={() => setEditState(true)}>
                      Edit
                    </button>
                  )}
          
                </Grid>
          
                <Paper sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    My Listings
                  </Typography>
          
                  {isListingsLoading ? (
                    <Box display="flex" justifyContent="center" my={4}>
                      <CircularProgress />
                    </Box>
                  ) : listingsError ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {listingsError}
                    </Alert>
                  ) : userListings.length === 0 ? (
                    <Typography color="text.secondary">
                      You haven't posted any listings yet.
                    </Typography>
                  ) : (
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      {userListings.map((listing) => (
                        <Grid item xs={12} sm={6} md={4} key={listing.id}>
                          <ListingCard listing={listing} />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>
              </Box>
            </Container>
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
    } as React.CSSProperties,
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

export default ProfileView;
