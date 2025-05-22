import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import DatabaseAdmin from './components/DatabaseAdmin';
import { checkDatabaseStatus } from './utils/seedData';
import { Database, BarChart3 } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [dbStatus, setDbStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

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
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Header - Maximum Left Alignment */}
      <header className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Smart Attendance System</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  currentView === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Database className="h-5 w-5 mr-2" />
                Database Admin
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {currentView === 'dashboard' ? (
          dbStatus && dbStatus.hasData ? (
            <Dashboard />
          ) : (
            <div className="max-w-4xl mx-auto p-6">
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
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
          )
        ) : (
          <div className="max-w-4xl mx-auto p-6">
            <DatabaseAdmin />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;