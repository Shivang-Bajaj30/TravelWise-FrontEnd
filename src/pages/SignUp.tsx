import { useState } from 'react';
import { signup } from '../lib/api';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Add state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setLoading(false);
      return;
    }

    try {
      const { username, email, password } = formData;
      const res = await signup({ name: username, email, password });
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else if (res.message) {
        setMessage({ type: 'success', text: res.message });
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setMessage({ type: 'error', text: 'Unknown response from server.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Signup failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full px-4 sm:px-0"
      style={{
        backgroundImage: 'url(/images/signup.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '89.1vh',
        marginTop: '-4px'
      }}>
      <div className="relative w-full max-w-2xl mx-auto flex items-center justify-center">
        <div className="relative z-10 p-4 sm:p-6 rounded-2xl shadow-lg backdrop-blur-2xl text-center text-white flex flex-col justify-center w-full" style={{ minHeight: '300px' }}>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 sm:mb-2 text-red-600 drop-shadow">Create Account 🚀</h1>
          <p className="mb-3 text-sm sm:text-base text-black">Join us and start planning your adventures!</p>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="text-left mb-1">
              <label className="block mb-1 font-semibold text-blue-600">Username</label>
              <input
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                name="username"
                id="username"
                type="text"
                disabled={loading}
                className="w-full p-2 rounded-lg bg-white bg-opacity-80 text-black border border-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-none text-base transition-colors duration-200 hover:bg-blue-50 focus:border-blue-400"
              />
            </div>

            <div className="text-left mb-1">
              <label className="block mb-1 font-semibold text-blue-600">Email</label>
              <input
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                name="email"
                id="email"
                type="email"
                disabled={loading}
                className="w-full p-2 rounded-lg bg-white bg-opacity-80 text-black border border-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-none text-base transition-colors duration-200 hover:bg-blue-50 focus:border-blue-400"
              />
            </div>

            <div className="text-left mb-1 relative">
              <label className="block mb-1 font-semibold text-blue-600">Password</label>
              <input
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                name="password"
                id="password"
                type={showPassword ? "text" : "password"}
                disabled={loading}
                className="w-full p-2 rounded-lg bg-white bg-opacity-80 text-black border border-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-none text-base transition-colors duration-200 hover:bg-blue-50 focus:border-blue-400 pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-9 text-gray-500 hover:text-blue-600 focus:outline-none"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                {showPassword ? (
                  // Eye open SVG
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  // Eye closed SVG
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.442-4.362M6.634 6.634A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.96 9.96 0 01-4.207 5.042M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>

            <div className="text-left mb-1 relative">
              <label className="block mb-1 font-semibold text-blue-600">Confirm Password</label>
              <input
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="********"
                name="confirmPassword"
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                disabled={loading}
                className="w-full p-2 rounded-lg bg-white bg-opacity-80 text-black border border-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-none text-base transition-colors duration-200 hover:bg-blue-50 focus:border-blue-400 pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-9 text-gray-500 hover:text-blue-600 focus:outline-none"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                {showConfirmPassword ? (
                  // Eye open SVG
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  // Eye closed SVG
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.442-4.362M6.634 6.634A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.96 9.96 0 01-4.207 5.042M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>

            {message.text && (
              <div className={`rounded p-2 mb-2 text-sm font-medium ${message.type === 'error'
                ? 'bg-red-100 text-red-700 border-l-4 border-red-700'
                : message.type === 'success'
                  ? 'bg-green-100 text-green-700 border-l-4 border-green-700'
                  : 'bg-yellow-100 text-yellow-700 border-l-4 border-yellow-700'
                }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 hover:from-blue-700 hover:via-purple-600 hover:to-blue-500 rounded-lg px-6 py-2 text-white font-bold mt-1 shadow-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-base border-none outline-none"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  Signing up...
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                </span>
              ) : 'Sign Up'}
            </button>
          </form>

          <p className="text-sm mt-3 text-black">
            Already have an account? <a href="/login" className="text-blue-600 underline font-semibold">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;