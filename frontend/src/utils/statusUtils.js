import { CheckCircle, Clock, XCircle } from 'lucide-react';

export const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'text-green-400';
    case 'pending':
      return 'text-yellow-400';
    case 'rejected':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-400" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-400" />;
    default:
      return null;
  }
};

export const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-600 text-white';
    case 'pending':
      return 'bg-yellow-600 text-white';
    case 'rejected':
      return 'bg-red-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
}; 