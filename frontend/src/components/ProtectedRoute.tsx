import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';

interface ProtectedRouteProps {
    component: React.ComponentType<any>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component }) => {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? (
        <>
            <Component />
        </>
    ) : (
        <Navigate to="/login" replace />
    );
};

export default ProtectedRoute
