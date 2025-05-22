import React, { useState } from 'react';
import { seedDatabase, checkDatabaseStatus } from '../utils/seedData';
import DiagnosticPanel from './DiagnosticPanel';
import ConnectionTest from './ConnectionTest';
import { Database, RefreshCw, CheckCircle, AlertCircle, Users, Clock, Bell, Settings, Wifi } from 'lucide-react';

const DatabaseAdmin = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'diagnostics'

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setError(null);
    setSeedResult(null);
    
    try {
      const result = await seedDatabase();
      setSeedResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const status = await checkDatabaseStatus();
      setDbStatus(status);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('admin')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'admin'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="inline h-5 w-5 mr-2" />
              Database Admin
            </button>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'diagnostics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="inline h-5 w-5 mr-2" />
              Diagnostics
            </button>
            <button
              onClick={() => setActiveTab('connection')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'connection'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Wifi className="inline h-5 w-5 mr-2" />
              Connection Test
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'admin' ? (
        <AdminContent 
          isSeeding={isSeeding}
          isChecking={isChecking}
          seedResult={seedResult}
          dbStatus={dbStatus}
          error={error}
          handleSeedDatabase={handleSeedDatabase}
          handleCheckStatus={handleCheckStatus}
        />
      ) : activeTab === 'diagnostics' ? (
        <DiagnosticPanel />
      ) : (
        <ConnectionTest />
      )}
    </div>
  );
};

// Extracted Admin Content Component
const AdminContent = ({ 
  isSeeding, 
  isChecking, 
  seedResult, 
  dbStatus, 
  error, 
  handleSeedDatabase, 
  handleCheckStatus 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Database className="h-8 w-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Database Administration</h2>
      </div>

      <div className="space-y-6">
        {/* Database Status Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Database Status</h3>
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Check Status'}
            </button>
          </div>

          {dbStatus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="text-2xl font-bold text-blue-600">{dbStatus.counts.students}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Attendance Records</p>
                    <p className="text-2xl font-bold text-green-600">{dbStatus.counts.attendance}</p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Bell className="h-6 w-6 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Alerts</p>
                    <p className="text-2xl font-bold text-red-600">{dbStatus.counts.alerts}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {dbStatus && (
            <div className="mt-4 p-3 rounded-lg flex items-center">
              {dbStatus.hasData ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800">Database has data</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800">Database is empty</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Seed Database Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Seed Database</h3>
          <p className="text-gray-600 mb-4">
            This will add sample data to your database including students, attendance records, and alerts.
            Use this to populate your database for testing and demonstration purposes.
          </p>
          
          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Database className={`h-5 w-5 mr-2 ${isSeeding ? 'animate-pulse' : ''}`} />
            {isSeeding ? 'Seeding Database...' : 'Seed Database'}
          </button>

          {seedResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-semibold text-green-800">Seeding Completed Successfully!</span>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• {seedResult.students} students added</li>
                <li>• {seedResult.attendanceRecords} attendance records added</li>
                <li>• {seedResult.alerts} alerts added</li>
              </ul>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="font-semibold text-red-800">Error:</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Instructions:</h4>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>First, check the database status to see if you already have data</li>
            <li>If the database is empty, use "Seed Database" to add sample data</li>
            <li>Navigate to the Dashboard to see your populated data</li>
            <li>You can seed the database multiple times (it will add more data)</li>
          </ol>
        </div>

        {/* Additional Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">What gets added:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Students:</strong> 10 sample students with names and student ID numbers</li>
            <li>• <strong>Attendance:</strong> 3-5 attendance records per student over the past week</li>
            <li>• <strong>Alerts:</strong> 4-6 unknown face alerts (unrecognized people detected)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DatabaseAdmin;