import React, { useState } from 'react';
import axios from 'axios';

const LoginTest = () => {
  const [status, setStatus] = useState('Ready to test');
  const [token, setToken] = useState('');

  const testLogin = async () => {
    try {
      setStatus('Logging in...');
      
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@example.com',
        password: 'admin123'
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        setStatus('Login successful! Token saved to localStorage.');
      } else {
        setStatus('Login failed: No token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      setStatus(`Login failed: ${error.message}`);
    }
  };

  const testAPI = async () => {
    try {
      setStatus('Testing API with token...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setStatus('No token found! Please login first.');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/users/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API response:', response.data);
      setStatus('API test successful! Check console for data.');
    } catch (error) {
      console.error('API error:', error);
      setStatus(`API test failed: ${error.message}`);
    }
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    setToken('');
    setStatus('Token cleared from localStorage');
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1f2937', color: 'white', minHeight: '100vh' }}>
      <h1>Login & API Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Status:</h3>
        <p>{status}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Current Token:</h3>
        <p style={{ wordBreak: 'break-all', fontSize: '12px' }}>
          {token || localStorage.getItem('token') || 'No token'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={testLogin}
          style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Test Login
        </button>
        
        <button 
          onClick={testAPI}
          style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Test API
        </button>
        
        <button 
          onClick={clearToken}
          style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Clear Token
        </button>
      </div>
    </div>
  );
};

export default LoginTest;