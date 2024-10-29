import React from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';

// Sample data for the information panel
const infoParameters = [
  { label: 'Product Name', value: 'Couch' },
  { label: 'Price', value: '100' },
  { label: 'User', value: 'Joe Smith' },
  { label: 'Condition', value: 'Used' },
  { label: 'Description', value: 'This is a blue couch big enough to sit 3 people comfortably. I bought it 2 years ago and need to get rid of it as I am moving.' },
  { label: 'Image', value: 'https://scontent.fykz1-2.fna.fbcdn.net/v/t45.5328-4/464668780_1639986103597933_7909698270533080824_n.jpg?stp=dst-jpg_p720x720&_nc_cat=101&ccb=1-7&_nc_sid=247b10&_nc_ohc=vqfj2KUmYwcQ7kNvgHU841l&_nc_zt=23&_nc_ht=scontent.fykz1-2.fna&_nc_gid=ABp5ih6_7hMgBWk1MQ6b71t&oh=00_AYCh4yIx7f1ysqa5Rh2Vy_Wu2PcPBSk3PgJ_Q9sGbPyI1w&oe=67260C3B' },
];

const ProductInfo: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={8} md={8}>
          {/* Image Section */}
          <Box
            component="img"
            src={infoParameters[5].value}
            alt="Small Visual"
            sx={{
              width: '100%',
              height: '70%',
              borderRadius: '8px',
              boxShadow: 2,
            }}
          />
        </Grid>

        <Grid item xs={4} md={4}>
          {/* Side Panel Section */}
          <Paper elevation={3} sx={{ padding: 2, height: '70%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left'}}>
            <Typography variant="h4" gutterBottom>
              <strong>{infoParameters[0].value}</strong>
            </Typography>

            <Box sx={{ marginBottom: 1 }}>
              <Typography variant="h6">
                <strong>${infoParameters[1].value} </strong>
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 1 }}>
              <Typography variant="h6">
                <strong>Seller:</strong> {infoParameters[2].value} 
              </Typography>
            </Box>
            
            <Box sx={{ marginBottom: 1 }}>
              <Typography variant="h6">
                <strong>Condition:</strong> {infoParameters[3].value} 
              </Typography>
            </Box>

            <Box sx={{ marginBottom: 1 }}>
              <Typography variant="h6">
                <strong>Description:</strong> {infoParameters[4].value} 
              </Typography>
            </Box>

          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductInfo;