import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-6">
            <Icon name="FileX" size={64} color="var(--color-primary)" />
          </div>
          <h1 className="text-6xl font-heading font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-heading font-semibold text-text-primary mb-2">Page Not Found</h2>
          <p className="text-text-secondary mb-8">
            The page you're looking for doesn't exist or has been moved to a different location.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 nav-transition flex items-center justify-center space-x-2"
          >
            <Icon name="Home" size={20} color="white" />
            <span>Go to Dashboard</span>
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full bg-surface border border-border text-text-primary py-3 px-6 rounded-lg font-medium hover:bg-background nav-transition flex items-center justify-center space-x-2"
          >
            <Icon name="ArrowLeft" size={20} color="var(--color-text-primary)" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-primary-50 rounded-lg">
          <p className="text-sm text-text-secondary mb-2">Need help finding what you're looking for?</p>
          <button className="text-sm text-secondary hover:text-secondary-700 nav-transition font-medium">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;