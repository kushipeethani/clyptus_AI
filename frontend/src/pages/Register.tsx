import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'recruiter',
      });
      setSuccessMsg('Account registered successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login', {
          state: {
            registeredEmail: data.email,
            message: 'Registration successful! Please sign in with your credentials.',
          },
        });
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030006] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-['Outfit',sans-serif]">
      {/* Ambient background glows matching login & landing page */}
      <div
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none opacity-25 filter blur-[150px] -top-[200px] -right-[100px]"
        style={{ background: 'radial-gradient(circle, #a855f7, #d946ef)' }}
      />
      <div
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none opacity-25 filter blur-[150px] -bottom-[200px] -left-[100px]"
        style={{ background: 'radial-gradient(circle, #8b5cf6, #4c1d95)' }}
      />

      {/* Top bar back link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4 relative z-10 flex items-center justify-between">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-[#c084fc] hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[#c084fc]">
          Security Gate v4.9
        </span>
      </div>

      {/* Header section with brand icon */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 px-4">
        <Link to="/" className="inline-flex items-center justify-center gap-3 mb-5 group">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.25)] group-hover:border-purple-400 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.45)] transition-all duration-300">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#regBrandGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="url(#regBrandGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="url(#regBrandGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="regBrandGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#c084fc" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            CLYPTUS<span className="text-[#a855f7]">.AI</span>
          </span>
        </Link>

        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Create <span className="bg-gradient-to-r from-white via-[#c084fc] to-[#d946ef] bg-clip-text text-transparent">Account</span>
        </h2>
        <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto">
          Register your credentials to access candidate intelligence and AI workflows
        </p>
      </div>

      {/* Card */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-[rgba(17,10,27,0.7)] backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(168,85,247,0.15)] py-8 px-5 sm:px-10">
          {successMsg ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Registration Complete!</h3>
              <p className="text-sm text-gray-300">{successMsg}</p>
              <div className="pt-2">
                <div className="w-6 h-6 border-2 border-[#a855f7]/30 border-t-[#a855f7] rounded-full animate-spin mx-auto" />
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-purple-200/80 mb-2 font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400/60">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    className="block w-full rounded-xl bg-[rgba(8,4,14,0.85)] border border-white/10 pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] transition-all duration-200"
                    {...register('name', { required: 'Full name is required' })}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.name.message as string}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-purple-200/80 mb-2 font-medium">
                  Work Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400/60">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    placeholder="recruiter@company.com"
                    className="block w-full rounded-xl bg-[rgba(8,4,14,0.85)] border border-white/10 pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] transition-all duration-200"
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.email.message as string}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-purple-200/80 mb-2 font-medium">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400/60">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="block w-full rounded-xl bg-[rgba(8,4,14,0.85)] border border-white/10 pl-11 pr-11 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] transition-all duration-200"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-purple-300 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.password.message as string}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-purple-200/80 mb-2 font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400/60">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="block w-full rounded-xl bg-[rgba(8,4,14,0.85)] border border-white/10 pl-11 pr-11 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] transition-all duration-200"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === password || 'Passwords do not match',
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-purple-300 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.confirmPassword.message as string}
                  </p>
                )}
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-[#a855f7] to-[#7c3aed] hover:from-[#c084fc] hover:to-[#9333ea] shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_35px_rgba(168,85,247,0.55)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Recruiter Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Sign in Link */}
          <div className="mt-6 text-center text-xs text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#c084fc] hover:text-white transition-colors">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
