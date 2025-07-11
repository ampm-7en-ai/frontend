
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  console.log('Index component rendering - should redirect to dashboard');
  // Redirect to the dashboard 
  return <Navigate to="/dashboard" replace />;
};

export default Index;
