import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Grid} from '@mui/material';

const Report: React.FC = () => {

    const [userName, setUserName] = useState('');
    const [description, setDescription] = useState('');
    
    const [files, setFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<Preview[]>([]);
    const [unknownFiles, setUnknownFiles] = useState<File[]>([]);

    interface Preview {
        name: string;
        src: string;
    }



    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        const previews: Preview[] = [];
        const validFiles: File[] = [];
        const unknown: File[] = [];

        selectedFiles.forEach(file => {
            if (file.type) {
                // Known MIME type
                validFiles.push(file);
                // If the file is an image, display it
                // if (file.type.startsWith('image/')) {
                // setImagePreviews(prev => [...prev, URL.createObjectURL(file)]);
                previews.push({ name: file.name, src: URL.createObjectURL(file) });
                // }
            } else {
                // Unknown MIME type
                unknown.push(file);
            }
        });

        setFiles(prevFiles => [...prevFiles, ...validFiles]);
        setUnknownFiles(prevUnknown => [...prevUnknown, ...unknownFiles]);
        setImagePreviews(prevPreviews => [...prevPreviews, ...previews]);
    };

    const handleUpload = () => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        console.log('Files ready for upload:', files);
        console.log('Unknown files (not uploaded):', unknownFiles);

        // TODO: Add API to handle file uploads
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
                    {imagePreviews.map((preview, index) => (
                        <div key={index} style={{ textAlign: 'center' }}>
                        <img src={preview.src} alt="File" style={{ width: '100px', height: '100px' }} />
                        <p>{preview.name}</p>
                        </div>
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