// src/components/Navbar/index.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaChartLine, 
  FaCloudUploadAlt, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser
} from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const navLinks = [
    { path: '/dashboard', name: 'Dashboard', icon: FaChartLine },
    { path: '/upload', name: 'Upload', icon: FaCloudUploadAlt },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo e Nome */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <FaChartLine className="text-white text-xl" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Meu Orçamento
              </span>
            </Link>
          </div>

          {/* Links Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Divisor */}
            <div className="h-8 w-px bg-gray-300" />

            {/* Informações do Usuário e Logout */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm">
                <FaUser className="text-gray-500" />
                <span className="text-gray-700 font-medium">
                  {user?.displayName || user?.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <FaSignOutAlt />
                <span>Sair</span>
              </button>
            </div>
          </div>

          {/* Botão Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700">
                <FaUser className="text-gray-500" />
                <span className="font-medium">
                  {user?.displayName || user?.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <FaSignOutAlt />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;