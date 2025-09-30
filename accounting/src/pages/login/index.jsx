import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Mock credentials for different user roles
  const mockCredentials = {
    'partner@accountingpro.com': { password: 'Partner123!', role: 'partner', name: 'Sarah Johnson' },
    'staff@accountingpro.com': { password: 'Staff123!', role: 'staff', name: 'Michael Chen' },
    'freelancer@accountingpro.com': { password: 'Freelancer123!', role: 'freelancer', name: 'Emily Rodriguez' },
    'client@accountingpro.com': { password: 'Client123!', role: 'client', name: 'David Thompson' }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const user = mockCredentials[formData.email];
      
      if (!user || user.password !== formData.password) {
        setErrors({
          general: 'Invalid email or password. Please check your credentials and try again.'
        });
        setIsLoading(false);
        return;
      }

      // Successful login - store user data and navigate
      localStorage.setItem('user', JSON.stringify({
        email: formData.email,
        role: user.role,
        name: user.name,
        isAuthenticated: true
      }));

      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  const handleForgotPassword = () => {
    console.log('Navigate to forgot password');
  };

  const demoCredentials = [
    { role: 'Partner', email: 'partner@accountingpro.com', password: 'Partner123!' },
    { role: 'Staff', email: 'staff@accountingpro.com', password: 'Staff123!' },
    { role: 'Freelancer', email: 'freelancer@accountingpro.com', password: 'Freelancer123!' },
    { role: 'Client', email: 'client@accountingpro.com', password: 'Client123!' }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mr-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-primary">AccountingPro</h1>
                <p className="text-sm text-text-secondary">Professional Financial Management</p>
              </div>
            </div>
            <h2 className="text-3xl font-heading font-bold text-text-primary">Welcome back</h2>
            <p className="mt-2 text-text-secondary">Sign in to your account to continue</p>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-error-100 border border-error-500 text-error-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} color="var(--color-error)" />
                <span className="text-sm">{errors.general}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="Mail" size={16} color="var(--color-text-secondary)" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent nav-transition ${
                      errors.email ? 'border-error-500 bg-error-50' : 'border-border bg-surface'
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-error-700 flex items-center space-x-1">
                    <Icon name="AlertCircle" size={12} color="var(--color-error)" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="Lock" size={16} color="var(--color-text-secondary)" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent nav-transition ${
                      errors.password ? 'border-error-500 bg-error-50' : 'border-border bg-surface'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <Icon 
                      name={showPassword ? 'EyeOff' : 'Eye'} 
                      size={16} 
                      color="var(--color-text-secondary)" 
                    />
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-error-700 flex items-center space-x-1">
                    <Icon name="AlertCircle" size={12} color="var(--color-error)" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-border-focus border-border rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-text-primary">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-secondary hover:text-secondary-700 nav-transition"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-border-focus disabled:opacity-50 disabled:cursor-not-allowed nav-transition"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Icon name="LogIn" size={16} color="white" />
                  <span>Sign in</span>
                </div>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-primary-50 rounded-lg">
            <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center space-x-2">
              <Icon name="Key" size={16} color="var(--color-primary)" />
              <span>Demo Credentials</span>
            </h3>
            <div className="space-y-2">
              {demoCredentials.map((cred, index) => (
                <div key={index} className="text-xs text-text-secondary">
                  <span className="font-medium">{cred.role}:</span> {cred.email} / {cred.password}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="hidden lg:flex lg:flex-1 bg-primary-100">
        <div className="flex-1 flex flex-col justify-center px-12">
          <div className="max-w-lg">
            <h2 className="text-3xl font-heading font-bold text-primary mb-6">
              Streamline Your Accounting Operations
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Professional accounting software designed for small firms and freelance accountants. 
              Automate bookkeeping, generate real-time reports, and ensure compliance with ease.
            </p>
            
            {/* Feature Highlights */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                  <Icon name="Check" size={16} color="white" />
                </div>
                <span className="text-text-primary">Automated double-entry bookkeeping</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                  <Icon name="Check" size={16} color="white" />
                </div>
                <span className="text-text-primary">Real-time financial reporting</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                  <Icon name="Check" size={16} color="white" />
                </div>
                <span className="text-text-primary">Tax compliance management</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                  <Icon name="Check" size={16} color="white" />
                </div>
                <span className="text-text-primary">Bank reconciliation automation</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-12">
            <div className="bg-surface rounded-lg shadow-floating p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-text-primary">Financial Overview</h3>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-error rounded-full"></div>
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Total Revenue</span>
                  <span className="font-medium text-success">$124,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Total Expenses</span>
                  <span className="font-medium text-error">$89,200</span>
                </div>
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-text-primary">Net Profit</span>
                    <span className="font-bold text-primary">$35,300</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;