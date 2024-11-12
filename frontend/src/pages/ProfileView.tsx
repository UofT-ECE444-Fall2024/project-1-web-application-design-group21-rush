import React, { useState, useEffect } from 'react';
import { Grid, Box, Container, CircularProgress, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { authApi, listingsApi } from '../services/api';
import { User } from '../types/user';
import { useNavigate } from 'react-router-dom';

const CenterImagePage: React.FC = () => {
    const categories = ['Sports Equipment', 'Books', 'Clothes', 'Laptops', 'Electronics', 'Furniture', 'Bikes', 'Collectables', 'Miscellaneous'];
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editedUser, setEditedUser] = useState(user);
    const [profilePicSrc, setProfilePicSrc] = useState("https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/1084px-Unknown_person.jpg?20200423155822");
    const [editState, setEditState] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [newImage, setNewImage] = useState<File | null>(null);


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

    const handleCategoryChange = (category: string) => {
        setSelectedCategories((prev) => {
            if (prev.includes(category)) {
                // Remove category if already selected
                return prev.filter((item) => item !== category);
            } else if (prev.length < 4) {
                // Add category if not selected and less than 4 selected
                return [...prev, category];
            }
            return prev; // Don't change state if already 4 selected
        });
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
        const selectedFiles = Array.from(event.target.files || []);
        selectedFiles.forEach(file => {
            if (file.type && editedUser) {
                setEditedUser({
                ...editedUser,
                profile_picture: URL.createObjectURL(file)
                });
                setProfilePicSrc(URL.createObjectURL(file));
            }
        });

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
            formData.append('username', editedUser.username);
            // formData.append('location', editedUser.location);
            formData.append('categories', JSON.stringify(editedUser.categories));

            if (newImage) {
                formData.append('profile_picture', URL.createObjectURL(newImage));
            }

            authApi.editUser(user);
            setUser(editedUser);
            // setProfilePicSrc(null);
            setEditState(false);
        }
    };

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
                        <img src={editedUser?.profile_picture || profilePicSrc} style={{ width: '200px', height: '200px', borderRadius: '100px'}} />
                    </div>
                </Grid>

                {editState ? (
                    <input 
                    type="file" 
                    multiple 
                    onChange={handleProfilePic}
                    accept=".jpg,.jpeg,.png" // Accept specific file types
                    />) 
                    : (<></>)
                }
                
                <Grid item xs={12} md={6} style={{ display: 'flex', gap: '10px', flexDirection: 'column', marginTop: '10px'}}>
                    <TextField
                        fullWidth size="small"
                        label="Name"
                        variant="outlined"
                        value={editedUser?.username || ''}
                        style={styles.label}
                        onChange={handleEditRequest('name')}
                        InputLabelProps={{ style: { fontWeight: 'bold'} }}
                        InputProps={{
                            style: styles.label,
                            readOnly: !editState,
                        }}
                    />
                    <FormControl fullWidth size="small" disabled={!editState}>
                        <InputLabel  style={{ fontWeight: 'bold' } }>Location</InputLabel>
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
                ) : (<>
                    <button type="submit" style={styles.button} onClick={()=>setEditState(true)}>
                    Edit
                    </button>
                </>)}

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
