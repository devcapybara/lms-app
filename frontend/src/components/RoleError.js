import React from 'react';
import { AlertTriangle, User, Shield, Settings } from 'lucide-react';

export default function RoleError({ currentRole, requiredRoles, onRetry }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 text-center">
        <div className="mb-6">
          <AlertTriangle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to access this feature</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-3">
            <User className="h-5 w-5 text-blue-400 mr-2" />
            <span className="text-white font-medium">Your Role: {currentRole}</span>
          </div>
          <div className="flex items-center justify-center">
            <Shield className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-white font-medium">
              Required: {Array.isArray(requiredRoles) ? requiredRoles.join(' or ') : requiredRoles}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-gray-300 text-sm">
            To access this feature, you need to have the appropriate role assigned to your account.
          </p>
          
          <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-3">
            <p className="text-yellow-200 text-sm">
              <strong>Quick Fix:</strong> Visit <code className="bg-gray-800 px-1 rounded">/debug/roles</code> to check and update user roles.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onRetry}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <a
              href="/debug/roles"
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
            >
              <Settings className="h-4 w-4 mr-1" />
              Debug Roles
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}