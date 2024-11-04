import { createTheme } from '@mui/material/styles';

// This file defines the custom theme for the application using Material-UI.
// It sets the primary colors to match UofT's official branding.

const theme = createTheme({
  palette: {
    primary: {
      main: '#002A5C', // UofT Blue
      contrastText: '#FFFFFF', // White text for blue backgrounds
    },
    background: {
      default: '#FFFFFF', // White background
      paper: '#FFFFFF', // White background for paper elements
    },
    error: {
      main: '#E31837', // Red for error states and special accents
    },
  },
});

export default theme;
