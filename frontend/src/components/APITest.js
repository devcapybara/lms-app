import React, { useEffect, useState } from 'react';
import { userAPI } from '../utils/userAPI';

const APITest = () => {
  const [results, setResults] = useState({
    token: null,
    dashboardStats: null,
    enrollmentTracking: null,
    errors: []
  });

  useEffect(() => {
    const testAPIs = async () => {
      const token = localStorage.getItem('token');
      console.log('Token check:', token ? 'Token exists' : 'No token');
      
      const newResults = {
        token: token ? 'Token exists' : 'No token',
        dashboardStats: null,
        enrollmentTracking: null,
        errors: []
      };

      // Test dashboard stats
      try {
        console.log('Testing dashboard stats...');
        const stats = await userAPI.getDashboardStats();
        newResults.dashboardStats = 'Success: ' + JSON.stringify(stats);
        console.log('Dashboard stats success:', stats);
      } catch (error) {
        const errorMsg = `Dashboard stats error: ${error.message}`;
        newResults.errors.push(errorMsg);
        console.error(errorMsg, error);
      }

      // Test enrollment tracking
      try {
        console.log('Testing enrollment tracking...');
        const tracking = await userAPI.getEnrollmentTracking();
        newResults.enrollmentTracking = 'Success: ' + JSON.stringify(tracking);
        console.log('Enrollment tracking success:', tracking);
      } catch (error) {
        const errorMsg = `Enrollment tracking error: ${error.message}`;
        newResults.errors.push(errorMsg);
        console.error(errorMsg, error);
      }

      setResults(newResults);
    };

    testAPIs();
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#1f2937', color: 'white', minHeight: '100vh' }}>
      <h1>API Test Results</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Token Status:</h3>
        <p>{results.token}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Dashboard Stats:</h3>
        <p>{results.dashboardStats || 'Loading...'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Enrollment Tracking:</h3>
        <p>{results.enrollmentTracking || 'Loading...'}</p>
      </div>

      {results.errors.length > 0 && (
        <div style={{ marginBottom: '20px', color: '#ef4444' }}>
          <h3>Errors:</h3>
          {results.errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default APITest;