import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { 
  BookOpen, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  GraduationCap,
  Settings,
  Target,
  TrendingUp,
  Users,
  ChevronDown
} from 'lucide-react';

const Layout = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = React.useState(false);

  const navigation = [
    { name: 'Beranda', href: '/', icon: Home },
    { name: 'Kursus', href: '/courses', icon: BookOpen },
  ];

  if (user) {
    navigation.push({ name: 'Dashboard', href: '/dashboard', icon: GraduationCap });
  }

  // Admin dropdown items
  const adminMenuItems = [
    { name: 'Students', href: '/users', icon: Users },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Platform Settings', href: '/platform-settings', icon: Settings },
    { name: 'Enrollment Management', href: '/admin/enrollments', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const isAdminPath = adminMenuItems.some(item => location.pathname === item.href);

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navigation */}
      <nav className="glass border-b border-dark-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gradient">Naik Satu Level</span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      location.pathname === item.href
                        ? 'text-primary-400 bg-primary-500/10 border border-primary-500/20'
                        : 'text-gray-300 hover:text-white hover:bg-dark-800'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Admin Dropdown */}
              {user && hasRole('admin') && (
                <div className="relative">
                  <button
                    onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isAdminPath
                        ? 'text-primary-400 bg-primary-500/10 border border-primary-500/20'
                        : 'text-gray-300 hover:text-white hover:bg-dark-800'
                    }`}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                    <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                      adminDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Dropdown Menu */}
                  {adminDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-50">
                      <div className="py-2">
                        {adminMenuItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={`flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                location.pathname === item.href
                                  ? 'text-primary-400 bg-primary-500/10'
                                  : 'text-gray-300 hover:text-white hover:bg-dark-700'
                              }`}
                              onClick={() => setAdminDropdownOpen(false)}
                            >
                              <Icon className="h-4 w-4 mr-3" />
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-dark-800 rounded-lg transition-all duration-200"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-ghost"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-300 hover:text-white hover:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass border-t border-dark-700/50">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-base font-medium rounded-lg transition-all duration-200 ${
                      location.pathname === item.href
                        ? 'text-primary-400 bg-primary-500/10 border border-primary-500/20'
                        : 'text-gray-300 hover:text-white hover:bg-dark-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile Admin Menu */}
              {user && hasRole('admin') && (
                <>
                  <div className="border-t border-dark-700 my-2"></div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Admin Menu
                  </div>
                  {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center px-3 py-2 text-base font-medium rounded-lg transition-all duration-200 ${
                          location.pathname === item.href
                            ? 'text-primary-400 bg-primary-500/10 border border-primary-500/20'
                            : 'text-gray-300 hover:text-white hover:bg-dark-800'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </Link>
                    );
                  })}
                </>
              )}
              
              {user ? (
                <>
                  <div className="border-t border-dark-700 my-2"></div>
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-dark-800 rounded-lg transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-dark-700 my-2"></div>
                  <Link
                    to="/login"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-dark-800 rounded-lg transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center px-3 py-2 text-base font-medium text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Click outside to close dropdown */}
        {adminDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setAdminDropdownOpen(false)}
          ></div>
        )}
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;