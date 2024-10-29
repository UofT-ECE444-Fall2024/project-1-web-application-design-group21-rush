import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import Header from './components/layout/Header';
import Home from './pages/Home';
import ProductInfo from './pages/ProductInfo';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import './App.css';

// This is the main App component that sets up the application.
// It includes routing and theming using Material-UI.

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productInfo" element={<ProductInfo />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* Additional routes will be added by team members */}
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
