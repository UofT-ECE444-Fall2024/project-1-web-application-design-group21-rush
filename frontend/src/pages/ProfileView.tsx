import React, { useState } from 'react';
import { Grid, Box, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

const CenterImagePage: React.FC = () => {
    const categories = ['Sports Equipment', 'Books', 'Clothes', 'Laptops', 'Electronics', 'Furniture', 'Bikes', 'Collectables', 'Miscellaneous'];

    const [profilePicSrc, setProfilePicSrc] = useState("https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/1084px-Unknown_person.jpg?20200423155822");
    // Handler functions to update state based on form input
    const [editState, setEditState] = useState(false);
    const changeEditState = () => setEditState(!editState);

    const [name, setName] = useState("John Doe");
    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value);

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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
    
    const [location, setLocation] = useState("Any");
    const handleLocationChange = (event:any) => setLocation(event.target.value);;

    const handleProfilePic = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        selectedFiles.forEach(file => {
            if (file.type) {
                setProfilePicSrc(URL.createObjectURL(file));
            }
            else {}
        });
    };

    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Grid container spacing={2} style={{display: 'flex', flexDirection: 'column',alignItems: 'center', 
                justifyContent: 'center'}}>

                <Grid item xs={12} md={3} style={{ display: 'flex', gap: '10px', marginTop: '10px'}}>
                    <div style={{ textAlign: 'center' }}>
                        <img src={profilePicSrc} style={{ width: '200px', height: '200px', borderRadius: '100px'}} />
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
                        value={name}
                        style={styles.label}
                        onChange={handleNameChange}
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
                            value={location}
                            onChange={handleLocationChange}
                            inputProps={{
                                style: styles.label,
                                readOnly: !editState,
                            }}>
                            <MenuItem value="Any">All Locations</MenuItem>
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
                                        checked={selectedCategories.includes(category)}
                                        disabled={!editState}
                                    />
                                    <label style={{ marginLeft: '5px' }}>{category}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </Grid>

                <button type="submit" style={styles.button} onClick={changeEditState}>
                    {editState ? (<>Save Changes</>) : (<>Edit</>)}
                </button>

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
