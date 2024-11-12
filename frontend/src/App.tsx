import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import Home from './pages/Home';
import ProductInfo from './pages/ProductInfo';
import ProfileView from './pages/ProfileView';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import CreateListing from './pages/CreateListing';
import Recommended from './pages/Recommended';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/layout/Header';
import { AuthProvider } from './context/AuthContext';
import Wishlist from './pages/Wishlist';
import Report from './pages/Report';
import UserView from './pages/UserView';
import './App.css';
import UserInterests from './pages/auth/UserInterests';
import VerifyEmail from './pages/auth/VerifyEmail';
import { WishlistProvider } from './context/WishlistContext';



function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <div className="App">
              <Header />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path='/choose-interests-upon-signup' element={<UserInterests/>}/>
                <Route path='/verifyEmail' element={<VerifyEmail/>}/>
                
                {/* Protected Routes */}
                
                <Route path="/productInfo/:id" element={<ProtectedRoute component={ProductInfo} />} />
                <Route path="/create-listing" element={<ProtectedRoute component={CreateListing} />} />
                <Route path="/recommended" element={<ProtectedRoute component={Recommended} />} />
                <Route path="/wishlist" element={<ProtectedRoute component={Wishlist} />} />
                <Route path="/report" element={<ProtectedRoute component={Report} />} />
                <Route path="/profile-view" element={<ProtectedRoute component={ProfileView} />} />
                <Route path="/user-view/:username" element={<ProtectedRoute component={UserView} />} />

              </Routes>
            </div>
          </Router>
        </ThemeProvider>
      </WishlistProvider>

    </AuthProvider>
  );
}

export default App;
