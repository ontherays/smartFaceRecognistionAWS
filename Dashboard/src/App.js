import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import DatabaseAdmin from './components/DatabaseAdmin';
import { checkDatabaseStatus } from './utils/databaseStatus';
import { BellRing, Database, BarChart3, Menu, X, Users, Calendar } from 'lucide-react';

// Mobile-optimized Avatar Component
const Avatar = ({ name, size = 40 }) => {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  
  return (
    <div 
      className="flex items-center justify-center rounded-full text-white font-medium flex-shrink-0"
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        backgroundColor: colors[colorIndex],
        fontSize: `${size / 2.5}px`
      }}
    >
      {initials}
    </div>
  );
};

// Mobile Header Component
const MobileHeader = ({ title, onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center min-w-0">
          <button 
            onClick={onMenuClick}
            className="lg:hidden mr-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 flex-shrink-0"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="relative">
            <BellRing size={20} className="text-gray-500" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
          </div>
          <Avatar name="Admin User" size={32} />
        </div>
      </div>
    </header>
  );
};

// Desktop Sidebar Component
const Sidebar = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', category: 'main' },
    { id: 'attendance', icon: Users, label: 'Attendance', category: 'main' },
    { id: 'reports', icon: Calendar, label: 'Reports', category: 'main' },
    { id: 'admin', icon: Database, label: 'Database Admin', category: 'admin' }
  ];

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-blue-800 lg:text-white">
      <div className="p-6">
        <h1 className="text-xl font-bold">Smart Attendance System</h1>
      </div>
      <nav className="flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center px-6 py-4 hover:bg-blue-700 transition-colors ${
                currentView === item.id ? 'bg-blue-700 border-r-4 border-white' : ''
              }`}
            >
              <Icon size={20} className="mr-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [dbStatus, setDbStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const status = await checkDatabaseStatus();
        setDbStatus(status);
        
        // If database is empty, show admin panel first
        if (!status.hasData) {
          setCurrentView('admin');
        }
      } catch (error) {
        console.error('Error checking database:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkDatabase();
  }, []);

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'attendance': return 'Attendance';
      case 'reports': return 'Reports';
      case 'admin': return 'Database Admin';
      default: return 'Smart Attendance System';
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="bg-white w-64 h-full p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold">Smart Attendance System</h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <nav className="space-y-2">
              {[
                { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
                { id: 'attendance', icon: Users, label: 'Attendance' },
                { id: 'reports', icon: Calendar, label: 'Reports' },
                { id: 'admin', icon: Database, label: 'Database Admin' }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      currentView === item.id ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} className="mr-3" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <MobileHeader 
          title={getPageTitle()} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-full">
            {currentView === 'admin' ? (
              <div className="p-4 sm:p-6">
                <DatabaseAdmin />
              </div>
            ) : dbStatus && dbStatus.hasData ? (
              <Dashboard activeTab={currentView} />
            ) : (
              <div className="p-4 sm:p-6">
                <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
                  <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
                  <p className="text-gray-600 mb-6">
                    Your database appears to be empty. Please use the Database Admin panel to add some sample data.
                  </p>
                  <button
                    onClick={() => setCurrentView('admin')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    Go to Database Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;