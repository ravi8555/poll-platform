// frontend/src/components/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { socketService } from '../../services/socketService';
import { 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon, 
  PlusCircleIcon, 
  ChartBarIcon,
  HomeIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  
  const connectCallbackRef = useRef<(() => void) | null>(null);
  const disconnectCallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleConnect = () => {
      console.log('Navbar: Socket connected');
      setSocketConnected(true);
    };
    
    const handleDisconnect = () => {
      console.log('Navbar: Socket disconnected');
      setSocketConnected(false);
    };
    
    connectCallbackRef.current = handleConnect;
    disconnectCallbackRef.current = handleDisconnect;
    
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    
    setSocketConnected(socketService.isConnected());
    
    return () => {
      if (connectCallbackRef.current) {
        socketService.off('connect', connectCallbackRef.current);
      }
      if (disconnectCallbackRef.current) {
        socketService.off('disconnect', disconnectCallbackRef.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Poll Platform</span>
            </Link>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link to="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link to="/dashboard" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <HomeIcon className="h-5 w-5 mr-1" />
                Dashboard
              </Link>
              <Link to="/polls/create" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <PlusCircleIcon className="h-5 w-5 mr-1" />
                Create Poll
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Socket Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-500">{socketConnected ? 'Live' : 'Offline'}</span>
            </div>

            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <ChartBarIcon className="h-4 w-4" />
                <span>My Polls</span>
              </div>
            </div>

            <div className="relative">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="hidden md:inline text-gray-700">{user.name}</span>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/polls/create" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>
                    Create Poll
                  </Link>
                  <hr className="my-1" />
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    <ArrowRightOnRectangleIcon className="h-4 w-4 inline mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isDropdownOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setIsDropdownOpen(false)} />
      )}
    </nav>
  );
};