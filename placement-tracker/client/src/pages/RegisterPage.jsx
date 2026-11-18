import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Lock, Mail, User, ArrowRight, AlertCircle, Loader2, CheckSquare, Square } from 'lucide-react';
import BrandMark from '../components/common/BrandMark';

const RegisterPage = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    agreedToTerms: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate(location.search.includes('quickAdd=1') ? '/dashboard?quickAdd=1' : '/dashboard', { replace: true });
    }
  }, [user, navigate, location.search]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.agreedToTerms) {
      errors.agreedToTerms = 'You must agree to the Terms and Privacy Policy to proceed';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setGeneralError('');

    try {
      await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        formData.agreedToTerms
      );
      navigate(location.search.includes('quickAdd=1') ? '/dashboard?quickAdd=1' : '/dashboard', { replace: true });
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      const validationErrs = err.response?.data?.errors;

      if (validationErrs && Array.isArray(validationErrs)) {
        const mappedErrors = {};
        validationErrs.forEach((e) => {
          mappedErrors[e.field] = e.message;
        });
        setFieldErrors(mappedErrors);
      } else if (serverMsg) {
        setGeneralError(serverMsg);
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('Network Error')) {
        setGeneralError('Could not reach the server. Please check your network or try again.');
      } else {
        setGeneralError('Registration failed. Please check your entries and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen poster-grid bg-paper text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mb-2 flex justify-center"><BrandMark size={44} /></div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              Create Candidate Account
            </h1>
            <p className="text-sm text-muted">
              Start tracking DSA practice with honest, verifiable analytics
            </p>
          </div>

          {/* Form Card */}
          <div className="neo-card bg-panel p-6 sm:p-8">
            {generalError && (
              <div className="mb-6 p-4 rounded-xl bg-punch-500/10 border border-punch-500/30 flex items-start gap-3 text-ink text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{generalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="Alex Johnson"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-paper/80 border text-sm text-ink placeholder:text-muted focus:outline-none transition-colors ${
                      fieldErrors.name
                        ? 'border-punch-500/60 focus:border-punch-500'
                        : 'border-line focus:border-punch-500'
                    }`}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-xs text-ink pt-0.5">{fieldErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="alex@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-paper/80 border text-sm text-ink placeholder:text-muted focus:outline-none transition-colors ${
                      fieldErrors.email
                        ? 'border-punch-500/60 focus:border-punch-500'
                        : 'border-line focus:border-punch-500'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-ink pt-0.5">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="Minimum 8 characters"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-paper/80 border text-sm text-ink placeholder:text-muted focus:outline-none transition-colors ${
                      fieldErrors.password
                        ? 'border-punch-500/60 focus:border-punch-500'
                        : 'border-line focus:border-punch-500'
                    }`}
                  />
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-ink pt-0.5">{fieldErrors.password}</p>
                )}
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="space-y-1.5 pt-1">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="sr-only"
                  />
                  <div className="shrink-0 mt-0.5 text-punk-500">
                    {formData.agreedToTerms ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4 text-muted" />
                    )}
                  </div>
                  <span className="text-xs text-muted leading-normal">
                    I acknowledge that I have read and agree to the{' '}
                    <Link
                      to="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-punk-500 underline hover:text-punk-500"
                    >
                      Terms & Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      to="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-punk-500 underline hover:text-punk-500"
                    >
                      Privacy Policy
                    </Link>.
                  </span>
                </label>
                {fieldErrors.agreedToTerms && (
                  <p className="text-xs text-ink">{fieldErrors.agreedToTerms}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl neo-button bg-punch-500 text-button font-bold text-sm hover:bg-punch-600 focus:outline-none focus:ring-2 focus:ring-punch-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-line/80 text-center text-xs text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-punk-500 font-semibold hover:underline">
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;
