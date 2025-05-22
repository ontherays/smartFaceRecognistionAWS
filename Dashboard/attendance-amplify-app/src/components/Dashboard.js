import React, { useState, useEffect } from 'react';
import { getAllStudents, getAllAttendanceRecords, getAllAlerts } from '../services/api';
import { Clock, Users, Calendar, AlertTriangle, Download, User, LogOut, ChevronDown, BellRing, Search, Menu, X } from 'lucide-react';

// Avatar Component
const Avatar = ({ name, size = 40 }) => {
  // Get initials from name
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  // Generate a consistent background color based on the name
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  
  return (
    <div 
      className="flex items-center justify-center rounded-full text-white font-medium"
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

// Data transformation functions
const transformAttendanceData = (attendanceRecords, students) => {
  return attendanceRecords.map(record => {
    const student = students.find(s => s.id === record.studentID);
    const timestamp = new Date(record.timestamp);
    
    return {
      id: record.id,
      name: student ? student.name : 'Unknown Student',
      studentIDNumber: student ? student.studentIDNumber : 'N/A',
      time: timestamp.toLocaleTimeString('en-US', { hour12: false }),
      date: timestamp.toLocaleDateString('en-US'),
      status: record.status === 'PRESENT' ? 'Present' : 
              record.status === 'LATE' ? 'Late' : 'Absent',
      confidence: record.confidence,
      studentId: record.studentID
    };
  });
};

const transformAlertsData = (alerts) => {
  return alerts.map(alert => {
    const timestamp = new Date(alert.timestamp);
    
    return {
      id: alert.id,
      message: alert.message,
      time: timestamp.toLocaleTimeString('en-US', { hour12: false }),
      date: timestamp.toLocaleDateString('en-US'),
      alertType: alert.alertType,
      acknowledged: alert.acknowledged,
      imageUrl: alert.imageUrl
    };
  });
};

// Generate chart data from attendance records
// Improved function to generate chart data from actual attendance records
const generateChartData = (attendanceRecords, students) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const chartData = [];
  
  // Get the last 7 days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push({
      date: date.toLocaleDateString('en-US'),
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      dayIndex: date.getDay() // 0 = Sunday, 1 = Monday, etc.
    });
  }

  // Filter to only weekdays (Monday-Friday)
  const weekdays = last7Days.filter(day => day.dayIndex >= 1 && day.dayIndex <= 5);

  weekdays.forEach(dayInfo => {
    // Filter attendance records for this specific day
    const dayAttendance = attendanceRecords.filter(record => {
      const recordDate = new Date(record.timestamp).toLocaleDateString('en-US');
      return recordDate === dayInfo.date;
    });

    // Count unique students by status for this day
    const presentStudents = new Set();
    const lateStudents = new Set();
    const absentStudents = new Set();

    dayAttendance.forEach(record => {
      if (record.status === 'PRESENT') {
        presentStudents.add(record.studentID);
      } else if (record.status === 'LATE') {
        lateStudents.add(record.studentID);
      } else if (record.status === 'ABSENT') {
        absentStudents.add(record.studentID);
      }
    });

    // Calculate absent students (total students minus those with records)
    const totalStudents = students.length;
    const studentsWithRecords = new Set([...presentStudents, ...lateStudents, ...absentStudents]);
    const actualAbsent = totalStudents - studentsWithRecords.size + absentStudents.size;

    chartData.push({
      name: dayInfo.dayName,
      present: presentStudents.size,
      absent: Math.max(0, actualAbsent), // Ensure non-negative
      late: lateStudents.size
    });
  });

  // If we don't have enough real data, fill with sample data
  if (chartData.length < 5) {
    const remainingDays = 5 - chartData.length;
    for (let i = 0; i < remainingDays; i++) {
      chartData.push({
        name: days[chartData.length],
        present: Math.floor(Math.random() * 50) + 30,
        absent: Math.floor(Math.random() * 10) + 2,
        late: Math.floor(Math.random() * 8) + 2
      });
    }
  }

  return chartData.slice(0, 5); // Only return 5 days (Monday-Friday)
};

// Main Dashboard Component
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State for real data
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transformed data for display
  const [displayAttendance, setDisplayAttendance] = useState([]);
  const [displayAlerts, setDisplayAlerts] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data from DynamoDB via GraphQL
        const [studentsData, attendanceData, alertsData] = await Promise.all([
          getAllStudents(),
          getAllAttendanceRecords(),
          getAllAlerts()
        ]);
        
        console.log('Fetched students:', studentsData);
        console.log('Fetched attendance:', attendanceData);
        console.log('Fetched alerts:', alertsData);
        
        setStudents(studentsData || []);
        setAttendanceRecords(attendanceData || []);
        setAlerts(alertsData || []);

        // Transform data for display
        const transformedAttendance = transformAttendanceData(attendanceData || [], studentsData || []);
        const transformedAlerts = transformAlertsData(alertsData || []);
        const generatedChartData = generateChartData(attendanceData || [], studentsData || []);

        setDisplayAttendance(transformedAttendance);
        setDisplayAlerts(transformedAlerts);
        setChartData(generatedChartData);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        
        // Set empty arrays as fallback
        setStudents([]);
        setAttendanceRecords([]);
        setAlerts([]);
        setDisplayAttendance([]);
        setDisplayAlerts([]);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateDashboardStats = (students, displayAttendance) => {
    const totalStudents = students.length;
    
    // Get today's date in the same format as displayed attendance records
    const today = new Date().toLocaleDateString('en-US');
    
    // Filter attendance records for today only
    const todaysAttendance = displayAttendance.filter(record => record.date === today);
    
    // Get unique students who were present today
    const uniquePresentStudents = new Set(
      todaysAttendance
        .filter(record => record.status === 'Present')
        .map(record => record.studentId)
    );
    const presentToday = uniquePresentStudents.size;
    
    // Get unique students who were late today
    const uniqueLateStudents = new Set(
      todaysAttendance
        .filter(record => record.status === 'Late')
        .map(record => record.studentId)
    );
    const lateToday = uniqueLateStudents.size;
    
    // Calculate absent: total students minus those who were present or late
    // This includes both students who were explicitly marked absent AND students with no record
    const absentToday = totalStudents - presentToday - lateToday;
    
    return {
      totalStudents,
      presentToday,
      lateToday,
      absentToday: Math.max(0, absentToday) // Ensure non-negative
    };
  };

  const stats = calculateDashboardStats(students, displayAttendance);
  const { totalStudents, presentToday, absentToday } = stats;

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-blue-800 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <nav className="mt-6 overflow-y-auto scroll-container" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <SidebarLink 
            icon={<Users />} 
            title="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => {
              setActiveTab('dashboard');
              setSidebarOpen(false);
            }} 
          />
          <SidebarLink 
            icon={<Clock />} 
            title="Attendance" 
            active={activeTab === 'attendance'} 
            onClick={() => {
              setActiveTab('attendance');
              setSidebarOpen(false);
            }} 
          />
          <SidebarLink 
            icon={<AlertTriangle />} 
            title="Alerts" 
            active={activeTab === 'alerts'} 
            onClick={() => {
              setActiveTab('alerts');
              setSidebarOpen(false);
            }} 
          />
          <SidebarLink 
            icon={<Calendar />} 
            title="Reports" 
            active={activeTab === 'reports'} 
            onClick={() => {
              setActiveTab('reports');
              setSidebarOpen(false);
            }} 
          />
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto scroll-container p-4 md:p-6">
          {activeTab === 'dashboard' && (
            <DashboardContent 
              students={students}
              displayAttendance={displayAttendance}
              displayAlerts={displayAlerts}
              chartData={chartData}
            />
          )}
          {activeTab === 'attendance' && <AttendanceContent displayAttendance={displayAttendance} />}
          {activeTab === 'alerts' && <AlertsContent displayAlerts={displayAlerts} />}
          {activeTab === 'reports' && <ReportsContent chartData={chartData} />}
        </main>
      </div>
    </div>
  );
};

// Sidebar Link Component
const SidebarLink = ({ icon, title, active, onClick }) => {
  return (
    <a 
      href="#" 
      className={`flex items-center px-6 py-4 hover:bg-blue-700 ${active ? 'bg-blue-700' : ''}`}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <span className="mr-3">{icon}</span>
      <span>{title}</span>
    </a>
  );
};

// Header Component
const Header = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-4 py-4 md:px-6">
        <div className="flex items-center">
          <button 
            className="mr-4 lg:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-base md:text-xl font-semibold text-gray-900 truncate">Face Recognition Attendance</h2>
        </div>
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="relative">
            <BellRing className="h-5 w-5 md:h-6 md:w-6 text-gray-500 hover:text-gray-700 cursor-pointer" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </div>
          <div className="flex items-center">
            <Avatar name="Admin User" size={32} />
            <span className="ml-2 font-medium hidden md:inline">Admin User</span>
            <ChevronDown className="h-4 w-4 ml-1 hidden md:block" />
          </div>
        </div>
      </div>
    </header>
  );
};

// Dashboard Content Component
const DashboardContent = ({ students, displayAttendance, displayAlerts, chartData }) => {
  // Calculate statistics using the improved logic
  const calculateDashboardStats = (students, displayAttendance) => {
    const totalStudents = students.length;
    
    // Get today's date in the same format as displayed attendance records
    const today = new Date().toLocaleDateString('en-US');
    
    // Filter attendance records for today only
    const todaysAttendance = displayAttendance.filter(record => record.date === today);
    
    // Get unique students who were present today
    const uniquePresentStudents = new Set(
      todaysAttendance
        .filter(record => record.status === 'Present')
        .map(record => record.studentId)
    );
    const presentToday = uniquePresentStudents.size;
    
    // Get unique students who were late today
    const uniqueLateStudents = new Set(
      todaysAttendance
        .filter(record => record.status === 'Late')
        .map(record => record.studentId)
    );
    const lateToday = uniqueLateStudents.size;
    
    // Calculate absent: total students minus those who were present or late
    // This includes both students who were explicitly marked absent AND students with no record
    const absentToday = totalStudents - presentToday - lateToday;
    
    return {
      totalStudents,
      presentToday,
      lateToday,
      absentToday: Math.max(0, absentToday) // Ensure non-negative
    };
  };

  const stats = calculateDashboardStats(students, displayAttendance);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents.toString()} 
          icon={<Users className="h-7 w-7 md:h-8 md:w-8 text-blue-500" />} 
          bgColor="bg-blue-100" 
        />
        <StatCard 
          title="Present Today" 
          value={stats.presentToday.toString()} 
          icon={<Clock className="h-7 w-7 md:h-8 md:w-8 text-green-500" />} 
          bgColor="bg-green-100" 
        />
        <StatCard 
          title="Late Today" 
          value={stats.lateToday.toString()} 
          icon={<Clock className="h-7 w-7 md:h-8 md:w-8 text-yellow-500" />} 
          bgColor="bg-yellow-100" 
        />
        <StatCard 
          title="Absent Today" 
          value={stats.absentToday.toString()} 
          icon={<AlertTriangle className="h-7 w-7 md:h-8 md:w-8 text-red-500" />} 
          bgColor="bg-red-100" 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 flex flex-col" style={{ minHeight: '400px' }}>
          <h3 className="text-base md:text-lg font-semibold mb-4">Attendance Chart</h3>
          <div className="flex-1 relative">
            {chartData.length > 0 ? (
              <AttendanceChart data={chartData} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No chart data available
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base md:text-lg font-semibold">Recent Attendances</h3>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">View All</a>
          </div>
          {displayAttendance.length > 0 ? (
            <AttendanceList attendances={displayAttendance.slice(0, 5)} compact={true} />
          ) : (
            <div className="text-gray-500 text-center py-8">
              No attendance records found
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base md:text-lg font-semibold">Recent Alerts</h3>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">View All</a>
          </div>
          {displayAlerts.length > 0 ? (
            <AlertsList alerts={displayAlerts.slice(0, 3)} />
          ) : (
            <div className="text-gray-500 text-center py-8">
              No alerts found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Attendance Content Component
const AttendanceContent = ({ displayAttendance }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold">Attendance Records</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <select className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Today</option>
            <option>Yesterday</option>
            <option>Last 7 days</option>
            <option>This month</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 md:p-6">
          {displayAttendance.length > 0 ? (
            <AttendanceList attendances={displayAttendance} compact={false} />
          ) : (
            <div className="text-gray-500 text-center py-12">
              <Clock size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Attendance Records</h3>
              <p>No attendance records found. Records will appear here once students check in.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Alerts Content Component
const AlertsContent = ({ displayAlerts }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold">Unknown Face Alerts</h2>
        <div className="text-sm text-gray-600">
          All alerts are for unrecognized faces detected in the classroom
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 md:p-6">
          {displayAlerts.length > 0 ? (
            <AlertsList alerts={displayAlerts} />
          ) : (
            <div className="text-gray-500 text-center py-12">
              <BellRing size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Alerts</h3>
              <p>No unknown face alerts found. This is good news!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reports Content Component
const ReportsContent = ({ chartData }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold">Attendance Reports</h2>
        <div>
          <button className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center">
            <Download className="mr-2 h-5 w-5" />
            Export Data
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Weekly Attendance</h3>
          {chartData.length > 0 ? (
            <AttendanceChart data={chartData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No chart data available
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Attendance Rate</h3>
          <div className="flex justify-center">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-green-500 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-green-500">87%</p>
                <p className="text-gray-500">Overall Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReportCard title="Daily Attendance" description="Complete daily attendance records" icon={<Calendar />} />
          <ReportCard title="Weekly Summary" description="Weekly attendance statistics" icon={<Calendar />} />
          <ReportCard title="Monthly Report" description="Monthly attendance trends" icon={<Calendar />} />
          <ReportCard title="Absence Report" description="Details of all absences" icon={<AlertTriangle />} />
          <ReportCard title="Late Arrivals" description="Analysis of late arrivals" icon={<Clock />} />
          <ReportCard title="Custom Report" description="Create a customized report" icon={<Download />} />
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, bgColor }) => {
  return (
    <div className={`${bgColor} rounded-lg p-4 md:p-6 shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-xs md:text-sm">{title}</p>
          <p className="text-2xl md:text-3xl font-bold mt-1">{value}</p>
        </div>
        <div>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Attendance List Component
// Updated Attendance List Component without ID column
const AttendanceList = React.memo(({ attendances, compact }) => {
  if (attendances.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No attendance records to display
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 md:mx-0 scroll-container">
      <div className="inline-block min-w-full align-middle">
        <div className="table-container">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                {!compact && <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>}
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                {!compact && <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendances.map((attendance) => (
                <AttendanceRow 
                  key={attendance.id} 
                  attendance={attendance} 
                  compact={compact} 
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

// Updated Attendance Row Component without ID column
const AttendanceRow = React.memo(({ attendance, compact }) => (
  <tr>
    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10">
          <Avatar name={attendance.name} size={32} />
        </div>
        <div className="ml-3 md:ml-4">
          <div className="text-xs md:text-sm font-medium text-gray-900">{attendance.name}</div>
          <div className="text-xs text-gray-500">ID: {attendance.studentIDNumber}</div>
        </div>
      </div>
    </td>
    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">{attendance.time}</td>
    {!compact && <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">{attendance.date}</td>}
    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        attendance.status === 'Present' ? 'bg-green-100 text-green-800' : 
        attendance.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : 
        'bg-red-100 text-red-800'
      }`}>
        {attendance.status}
      </span>
    </td>
    {!compact && <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
      {attendance.confidence ? `${Math.round(attendance.confidence * 100)}%` : 'N/A'}
    </td>}
  </tr>
));

// Alerts List Component
const AlertsList = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No alerts to display
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {alerts.map((alert) => (
        <div key={alert.id} className="flex items-start p-3 md:p-4 border rounded-lg bg-red-50 border-red-200">
          <AlertTriangle className="h-8 w-8 md:h-12 md:w-12 text-red-500 mr-3 md:mr-4 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:justify-between">
              <p className="font-medium text-red-800 text-sm md:text-base">{alert.message}</p>
              <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-0">{alert.time}</p>
            </div>
            <p className="text-xs md:text-sm text-gray-500">{alert.date}</p>
            <div className="flex items-center mt-2">
              {alert.acknowledged ? (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Acknowledged
                </span>
              ) : (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                  Unacknowledged
                </span>
              )}
            </div>
          </div>
          <button className="ml-2 text-gray-400 hover:text-gray-500">
            <span className="sr-only">Dismiss</span>
            <X size={20} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Attendance Chart Component
// Fixed Attendance Chart Component
// Updated Attendance Chart Component that fills the container
// Fixed Attendance Chart Component with visible bars that fill the container
const AttendanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No chart data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => Math.max(item.present, item.absent, item.late)));
  
  // If maxValue is 0, show a message
  if (maxValue === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No attendance data to display
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Legend - compact version */}
      <div className="flex justify-center mb-4 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 mr-1.5 rounded"></div>
          <span className="text-xs font-medium">Present</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 mr-1.5 rounded"></div>
          <span className="text-xs font-medium">Absent</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 mr-1.5 rounded"></div>
          <span className="text-xs font-medium">Late</span>
        </div>
      </div>
      
      {/* Chart area - uses remaining space with fixed pixel heights */}
      <div className="flex-1 flex items-end justify-between px-4 relative" style={{ minHeight: '250px' }}>
        {data.map((item, index) => {
          // Calculate heights in pixels based on container height
          const containerHeight = 250; // Fixed height for calculations
          const presentHeight = Math.max((item.present / maxValue) * containerHeight * 0.8, item.present > 0 ? 8 : 0);
          const absentHeight = Math.max((item.absent / maxValue) * containerHeight * 0.8, item.absent > 0 ? 8 : 0);
          const lateHeight = Math.max((item.late / maxValue) * containerHeight * 0.8, item.late > 0 ? 8 : 0);
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              {/* Bar container */}
              <div className="w-full flex justify-center items-end space-x-1 mb-3" style={{ height: '200px' }}>
                {/* Present bar */}
                <div className="relative group">
                  <div 
                    className="bg-green-500 rounded-t-sm transition-all duration-300 hover:bg-green-600 cursor-pointer" 
                    style={{ 
                      height: `${presentHeight}px`,
                      width: '24px',
                    }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Present: {item.present}
                  </div>
                </div>
                
                {/* Absent bar */}
                <div className="relative group">
                  <div 
                    className="bg-red-500 rounded-t-sm transition-all duration-300 hover:bg-red-600 cursor-pointer" 
                    style={{ 
                      height: `${absentHeight}px`,
                      width: '24px',
                    }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Absent: {item.absent}
                  </div>
                </div>
                
                {/* Late bar */}
                <div className="relative group">
                  <div 
                    className="bg-yellow-500 rounded-t-sm transition-all duration-300 hover:bg-yellow-600 cursor-pointer" 
                    style={{ 
                      height: `${lateHeight}px`,
                      width: '24px',
                    }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Late: {item.late}
                  </div>
                </div>
              </div>
              
              {/* Day label */}
              <div className="text-sm text-gray-700 font-medium text-center">
                {item.name.substring(0, 3)}
              </div>
            </div>
          );
        })}
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs text-gray-400 pr-2">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
      </div>
    </div>
  );
};

// Report Card Component
const ReportCard = ({ title, description, icon }) => {
  return (
    <div className="border rounded-lg p-3 md:p-4 flex items-start hover:bg-blue-50 cursor-pointer">
      <div className="p-2 md:p-3 bg-blue-100 rounded-lg mr-3 md:mr-4">
        {icon}
      </div>
      <div>
        <h4 className="text-sm md:text-base font-medium">{title}</h4>
        <p className="text-xs md:text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

// Status Item Component
const StatusItem = ({ label, status, statusColor }) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm md:text-base text-gray-700">{label}</span>
      <span className={`text-sm md:text-base font-medium ${statusColor}`}>{status}</span>
    </div>
  );
};

// Info Item Component
const InfoItem = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm md:text-base font-medium">{value}</span>
    </div>
  );
};

export default Dashboard;