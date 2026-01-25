import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Loader2, AlertCircle, Key, Mail, Send, Shield, Check } from 'lucide-react';
import { authApi } from '../../api/client';

// Floating particle component
function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="admin-login-particles" />;
}

type LoginMethod = 'password' | 'email';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(email, password);
      if (response.success) {
        navigate('/admin/dashboard');
      } else {
        setError(response.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate sending email link (in production, this would call the API)
    setTimeout(() => {
      setEmailSent(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="admin-login-container">
      {/* Animated background */}
      <div className="admin-login-bg" />
      <FloatingParticles />

      {/* Login Card */}
      <motion.div
        className="admin-login-card"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Logo */}
        <div className="admin-login-header">
          <motion.div
            className="admin-login-logo-wrapper"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <img 
              src="/images/logo.png" 
              alt="OKJTech" 
              className="admin-login-logo"
            />
          </motion.div>
          <h1 className="admin-login-title">OKJTech</h1>
          <p className="admin-login-subtitle">Admin Dashboard</p>
        </div>

        {/* Login Method Tabs */}
        <div className="admin-login-tabs">
          <button
            type="button"
            className={`admin-login-tab ${loginMethod === 'password' ? 'active' : ''}`}
            onClick={() => {
              setLoginMethod('password');
              setEmailSent(false);
              setError(null);
            }}
          >
            <Key size={16} />
            Password Login
          </button>
          <button
            type="button"
            className={`admin-login-tab ${loginMethod === 'email' ? 'active' : ''}`}
            onClick={() => {
              setLoginMethod('email');
              setEmailSent(false);
              setError(null);
            }}
          >
            <Send size={16} />
            Email Link
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-login-error"
          >
            <AlertCircle size={18} />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Email Sent Success */}
        {emailSent && loginMethod === 'email' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-login-success"
          >
            <Check size={18} />
            <p>Login link sent to your email!</p>
          </motion.div>
        )}

        {/* Password Login Form */}
        {loginMethod === 'password' && (
          <motion.form
            onSubmit={handlePasswordLogin}
            className="admin-login-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="admin-login-field">
              <label htmlFor="email" className="admin-login-label">
                <Mail size={14} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your admin email"
                required
                autoComplete="email"
                className="admin-login-input"
              />
            </div>

            <div className="admin-login-field">
              <label htmlFor="password" className="admin-login-label">
                <Key size={14} />
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="admin-login-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="admin-login-button"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Login
                </>
              )}
            </button>
          </motion.form>
        )}

        {/* Email Link Form */}
        {loginMethod === 'email' && !emailSent && (
          <motion.form
            onSubmit={handleEmailLink}
            className="admin-login-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="admin-login-field">
              <label htmlFor="email-link" className="admin-login-label">
                <Mail size={14} />
                Email Address
              </label>
              <input
                type="email"
                id="email-link"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your admin email"
                required
                autoComplete="email"
                className="admin-login-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="admin-login-button"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending link...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Login Link
                </>
              )}
            </button>
          </motion.form>
        )}

        {/* Secure Login Info */}
        <motion.div
          className="admin-login-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="admin-login-info-header">
            <Shield size={16} />
            <span>Secure Login</span>
          </div>
          <ul className="admin-login-info-list">
            <li>
              <Check size={12} />
              Password login for local access
            </li>
            <li>
              <Check size={12} />
              Email link login for remote access
            </li>
            <li>
              <Check size={12} />
              Default password: admin123
            </li>
            <li>
              <Check size={12} />
              Secure encrypted sessions
            </li>
          </ul>
        </motion.div>
      </motion.div>

      {/* Back to Site */}
      <motion.div
        className="admin-login-back"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <a href="/">← Back to website</a>
      </motion.div>
    </div>
  );
}
