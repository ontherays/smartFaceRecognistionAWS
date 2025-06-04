import React, { useState } from 'react';
import { checkDatabaseStatus } from '../utils/databaseStatus';
import DiagnosticPanel from './DiagnosticPanel';
import ConnectionTest from './ConnectionTest';
import { Database, RefreshCw, CheckCircle, AlertCircle, Users, Clock, Settings, Wifi, BarChart3 } from 'lucide-react';

const DatabaseAdmin = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('status');

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
              onClick={() => setActiveTab('status')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'status'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="inline h-5 w-5 mr-2" />
              Database Status
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
      {activeTab === 'status' ? (
        <StatusContent 
          isChecking={isChecking}
          dbStatus={dbStatus}
          error={error}
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

// Database Status Content Component
const StatusContent = ({ 
  isChecking, 
  dbStatus, 
  error, 
  handleCheckStatus
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Database className="h-8 w-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Database Status Monitor</h2>
      </div>

      <div className="space-y-6">
        {/* Status Overview */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-2 mr-3">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Database Overview</h3>
              <p className="text-gray-600">Monitor your attendance system's data status</p>
            </div>
          </div>

          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking Status...' : 'Check Database Status'}
          </button>
        </div>

        {/* Database Status Display */}
        {dbStatus && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Database Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Students Count */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-3xl font-bold text-blue-600">{dbStatus.counts.students}</p>
                  </div>
                </div>
              </div>

              {/* Attendance Records Count */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Attendance Records</p>
                    <p className="text-3xl font-bold text-green-600">{dbStatus.counts.attendance}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Status */}
            <div className={`p-4 rounded-lg border ${
              dbStatus.hasData 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center">
                {dbStatus.hasData ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <span className="font-semibold text-green-800">Database Status: Active</span>
                      <p className="text-green-700 text-sm">Your database contains student and attendance data.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
                    <div>
                      <span className="font-semibold text-yellow-800">Database Status: Empty</span>
                      <p className="text-yellow-700 text-sm">Your database is empty. Data will appear as students use the attendance system.</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Data Details (if available) */}
            {dbStatus.details && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Data Summary</h4>
                
                {dbStatus.details.students && dbStatus.details.students.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Recent Students:</p>
                    <div className="space-y-1">
                      {dbStatus.details.students.slice(0, 5).map((student, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {student.name} (ID: {student.id})
                        </div>
                      ))}
                      {dbStatus.details.students.length > 5 && (
                        <div className="text-sm text-gray-500">
                          ... and {dbStatus.details.students.length - 5} more students
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {dbStatus.details.recentAttendance && dbStatus.details.recentAttendance.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Recent Attendance:</p>
                    <div className="space-y-1">
                      {dbStatus.details.recentAttendance.map((record, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {record.student} - {record.date} at {record.time}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="font-semibold text-red-800">Error:</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <div className="mt-3 text-sm text-red-600">
              <p className="font-medium">Troubleshooting tips:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Check your internet connection</li>
                <li>Verify the database connection using the Diagnostics tab</li>
                <li>Try the Connection Test for detailed analysis</li>
              </ul>
            </div>
          </div>
        )}

        {/* Information Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📊 About Database Monitoring</h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Real-time Status:</strong> Monitor your attendance system's current data state</p>
            <p><strong>Data Insights:</strong> View student count and attendance record statistics</p>
            <p><strong>System Health:</strong> Ensure your database is properly connected and functioning</p>
            <p><strong>Troubleshooting:</strong> Use Diagnostics and Connection Test tabs for detailed analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseAdmin;