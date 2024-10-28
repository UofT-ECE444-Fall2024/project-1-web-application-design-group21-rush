import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import './App.css';

// This is the main App component that sets up the application.
// It includes routing and theming using Material-UI.

function App() {
  return (
    <ThemeProvider theme={theme}> {/* Applies the custom theme to the app */}
      <CssBaseline /> {/* Resets CSS to ensure consistent styling across browsers */}
      <Router> {/* Enables routing in the application */}
        <div className="App">
          {/* TODO: Youssef - Add Header component here */}
          {/* TODO: Add routes here for:
              - Home page (Mehdi)
              - Login/Signup pages (Rameen)
              - Product listing pages (Ryan)
          */}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
