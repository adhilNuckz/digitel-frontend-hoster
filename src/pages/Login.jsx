import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Github } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup, loginWithGitHub } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (!formData.name) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        await signup(formData.email, formData.password, formData.name);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      await loginWithGitHub();
    } catch (err) {
      setError(err.message || 'Failed to login with GitHub');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-dark-500 dark:to-dark-400 flex items-center justify-center px-4">
      <div className="max-w-md w-full animate-fadeIn">
        <div className="bg-white dark:bg-dark-300 rounded-xl shadow-2xl shadow-neon-500/10 dark:shadow-neon-500/20 p-8 border border-gray-200 dark:border-neon-500/30">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-neon-500 animate-glow">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {isLogin ? 'Sign in to your account' : 'Sign up to get started'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            )}
            
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              helperText={!isLogin ? "Minimum 8 characters" : ""}
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full mb-4"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-neon-500/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-dark-300 text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGitHubLogin}
            className="w-full flex items-center justify-center space-x-2 bg-gray-900 dark:bg-dark-500 text-white py-2 px-4 rounded-lg hover:bg-gray-800 dark:hover:bg-dark-400 border border-transparent dark:border-neon-500/30 transition-all hover:scale-105 hover:shadow-lg hover:shadow-neon-500/20"
          >
            <Github className="h-5 w-5" />
            <span className="font-medium">GitHub</span>
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-neon-500 hover:text-neon-400 text-sm font-bold transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
