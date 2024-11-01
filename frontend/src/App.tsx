import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import Home from './pages/Home';
import ProductInfo from './pages/ProductInfo';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import CreateListing from './pages/CreateListing';
import Recommended from './pages/Recommended';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';


function App() {
  return (
    <AuthProvider> {}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={< Home />} />
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}    
              {/* removed the protection for these routes for now (until users are fully implemented)*/}
              {/*<Route path="/" element={< Home />} />*/}
              <Route path="/productInfo" element={<ProductInfo />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/recommended" element={<Recommended />} />

            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
