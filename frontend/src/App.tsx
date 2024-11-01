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
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/home" element={<Home />} />
              <Route path="/create-listing" element={<CreateListing />} />
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute component={Home} />} />
              <Route path="/productInfo" element={<ProtectedRoute component={ProductInfo} />} />
              <Route path="/create-listing" element={<CreateListing />} />

            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
