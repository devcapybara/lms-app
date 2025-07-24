// Test script untuk debug userAPI
import { userAPI } from './userAPI.js';

const testAPI = async () => {
  console.log('Testing userAPI...');
  
  // Check if token exists
  const token = localStorage.getItem('token');
  console.log('Token exists:', !!token);
  console.log('Token:', token ? token.substring(0, 50) + '...' : 'No token');
  
  try {
    console.log('Testing dashboard stats...');
    const stats = await userAPI.getDashboardStats();
    console.log('Dashboard stats success:', stats);
  } catch (error) {
    console.error('Dashboard stats failed:', error);
  }
  
  try {
    console.log('Testing enrollment tracking...');
    const tracking = await userAPI.getEnrollmentTracking();
    console.log('Enrollment tracking success:', tracking);
  } catch (error) {
    console.error('Enrollment tracking failed:', error);
  }
};

// Export for use in browser console
window.testAPI = testAPI;

export default testAPI;