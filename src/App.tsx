import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  PlusCircle, 
  LayoutDashboard, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck,
  Leaf,
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from './utils';

// Types
import { User, Complaint, Stats } from './types';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Report from './pages/Report';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <Leaf className="text-white w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900">
                Eco<span className="text-primary">Clean</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-slate-600 hover:text-primary font-medium">Home</Link>
              {user ? (
                <>
                  <Link to="/report" className="text-slate-600 hover:text-primary font-medium flex items-center gap-1">
                    <PlusCircle className="w-4 h-4" /> Report
                  </Link>
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-slate-600 hover:text-primary font-medium flex items-center gap-1">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <div className="h-6 w-px bg-slate-200" />
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{user.role}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-slate-600 hover:text-primary font-medium px-4 py-2">Login</Link>
                  <Link to="/register" className="btn-primary">Get Started</Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                <Link to="/" className="block text-lg font-medium text-slate-900">Home</Link>
                {user ? (
                  <>
                    <Link to="/report" className="block text-lg font-medium text-slate-900">Report Garbage</Link>
                    <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="block text-lg font-medium text-slate-900">Dashboard</Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left text-lg font-medium text-red-600 pt-4 border-t border-slate-100"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block text-lg font-medium text-slate-900">Login</Link>
                    <Link to="/register" className="block btn-primary text-center">Register</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register setUser={setUser} />} />
              <Route path="/report" element={<Report user={user} />} />
              <Route path="/dashboard" element={<UserDashboard user={user} />} />
              <Route path="/admin" element={<AdminDashboard user={user} />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Leaf className="text-primary w-6 h-6" />
                <span className="font-display font-extrabold text-2xl tracking-tight text-white">
                  Eco<span className="text-primary">Clean</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                Empowering citizens to build cleaner, smarter cities through technology and community action.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link to="/report" className="hover:text-primary transition-colors">Report Issue</Link></li>
                <li><Link to="/dashboard" className="hover:text-primary transition-colors">My Reports</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <p className="text-sm">Email: support@ecoclean.org</p>
              <p className="text-sm">Phone: +1 (555) 123-4567</p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs">
            © 2026 EcoClean Smart Waste Management. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
