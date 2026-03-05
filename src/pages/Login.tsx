import { useState } from 'react';
import { login } from '../lib/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const { email, password } = formData;

      if (!email || !password) {
        setMessage({ type: 'error', text: 'Please fill in all fields.' });
        setLoading(false);
        return;
      }

      const res = await login(email, password);

      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else if (res.message) {
        setMessage({ type: 'success', text: res.message });

        // optional: store user info in localStorage
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }

        // redirect to home or dashboard after login
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setMessage({ type: 'error', text: 'Unexpected server response.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Login failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full px-4 sm:px-0"
      style={{
        backgroundImage: 'url(/images/login.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '89.1vh',
        marginTop: '-4px'
      }}>
      <div className="relative w-full max-w-2xl mx-auto flex items-center justify-center">
        <div className="relative z-10 p-4 sm:p-6 rounded-2xl shadow-lg backdrop-blur-2xl text-center text-white flex flex-col justify-center w-full" style={{ minHeight: '300px' }}>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 sm:mb-2 text-blue-600 drop-shadow">Welcome Back 👋</h1>
          <p className="mb-3 text-sm sm:text-base text-black">Login to continue exploring!</p>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
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

            <div className="text-left mb-1">
              <label className="block mb-1 font-semibold text-blue-600">Password</label>
              <input
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                name="password"
                id="password"
                type="password"
                disabled={loading}
                className="w-full p-2 rounded-lg bg-white bg-opacity-80 text-black border border-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-none text-base transition-colors duration-200 hover:bg-blue-50 focus:border-blue-400"
              />
            </div>

            {message.text && (
              <div className={`rounded p-2 mb-2 text-sm font-medium ${
                message.type === 'error'
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
                  Logging in...
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                </span>
              ) : 'Login'}
            </button>
          </form>

          <p className="text-sm mt-3 text-black">
            Don’t have an account? <a href="/signup" className="text-blue-600 underline font-semibold">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
