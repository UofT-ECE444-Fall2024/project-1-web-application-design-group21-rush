import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const interestsList = [
  'Books',
  'Clothes',
  'Laptops',
  'Furniture',
  'Electronics'
];

const UserInterests: React.FC = () => {
  const [interests, setInterests] = useState<string[]>([]); //This is where the interests will be stored
  const [alertMsg, setAlertMsg] = useState('');
  const navigate = useNavigate();
  
  const interestClicked = (interest: string) => {
    if (interests.includes(interest)) { //if its already been selected, then remove the 
      setInterests((currentElements) => currentElements.filter((element) => element !== interest)); //filters out the interest deselected by user from the interests array
    } else {
      if (interests.length < 4) { //makes sure user cant choose more than 4
        setInterests((currentElements) => [...currentElements, interest]);
      } 
    }
  };

  const handleContinue = () => {
    if (interests.length < 1) { //ensures that at least 1 interest is selected
      setAlertMsg('Please select at least 1 interest.');
      setTimeout(() => {
        setAlertMsg('');
      }, 3000); //3 seconds
      return;
    }
    setAlertMsg('');
    console.log('Selected interests:', interests);
    navigate('/home'); //---------------------------Navigates to HOME---------------------------
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Choose Your Interests
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom sx={{ color: 'grey.600', mt: 2 }}> 
          Choose 1-4 interests
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'center',
            mt: 2
          }}
        >
          {interestsList.map((interest) => (
            <Button
              key={interest}
              variant={interests.includes(interest) ? 'contained' : 'outlined'} //if the interest is in the interests array(meaning that it has been selected, it is filled)
              color={interests.includes(interest) ? 'primary' : undefined}
              onClick={() => interestClicked(interest)}
              disabled={
                interests.length >= 4 && !interests.includes(interest)
              }
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
              }}
            >
              {interest}
            </Button>
          ))}
        </Box>

        <Typography
          variant="body2"
          align="center"
          sx={{ color: 'grey.600', mt: 2 }}
        >
          {interests.length} selected {/*prints the number of interests currently selected*/}
        </Typography>

        {alertMsg && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {alertMsg}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 4 }}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </Paper>
    </Container>
  );
};

export default UserInterests;
