import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Grid} from '@mui/material';

const Report: React.FC = () => {

    const [userName, setUserName] = useState('');
    const [description, setDescription] = useState('');
    
    const [files, setFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [unknownFiles, setUnknownFiles] = useState<File[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        const validFiles: File[] = [];
        const unknown: File[] = [];

        selectedFiles.forEach(file => {
            if (file.type) {
                // Known MIME type
                validFiles.push(file);
                // If the file is an image, display it
                if (file.type.startsWith('image/')) {
                    setImagePreviews(prev => [...prev, URL.createObjectURL(file)]);
                }
            } else {
                // Unknown MIME type
                unknown.push(file);
            }
        });

        setFiles(validFiles);
        setUnknownFiles(unknown);
    };

    const handleUpload = () => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        console.log('Files ready for upload:', files);
        console.log('Unknown files (not uploaded):', unknownFiles);

        // Uncomment for API call
        // fetch('/api/upload', { method: 'POST', body: formData })
        //   .then(response => response.json())
        //   .then(data => console.log('Upload successful:', data))
        //   .catch(error => console.error('Upload error:', error));
    };

    return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
            File complaint
        </Typography>

        <form>
            <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                label="User Name"
                variant="outlined"
                fullWidth
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                label="Description"
                variant="outlined"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                />
            </Grid>
            <Grid item xs={12}>
                <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf,.docx,.txt" // Accept specific file types
                />

                {imagePreviews.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    {imagePreviews.map((src, index) => (
                        <img key={index} src={src} alt="Preview" style={{ width: '100px', height: '100px' }} />
                    ))}
                    </div>
                )}
            </Grid>
            <Grid item xs={12}>
                <Button onClick={handleUpload}>Submit </Button>
            </Grid>
            </Grid>
        </form>

        </Paper>
    </Container>
    );
};

export default Report;