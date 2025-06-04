import React, { useState, useEffect } from 'react';
import { getAllStudents, getAllAttendanceRecords } from '../services/api';
import { Clock, Users, Calendar, AlertTriangle, Download, Search, ChevronRight, CheckCircle } from 'lucide-react';

// ===== UTILITY FUNCTIONS =====
const getRelativeDate = (dateString) => {
  const attendanceDate = new Date(dateString);
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const attendanceMidnight = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate());
  const diffDays = Math.floor((todayMidnight - attendanceMidnight) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1) return `${diffDays} days ago`;
  if (diffDays === -1) return 'Tomorrow';
  return `In ${Math.abs(diffDays)} days`;
};

const getStatusColor = (status) => 
  status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

const Avatar = ({ name, size = 40 }) => {
  const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
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

const StatCard = ({ title, value, icon, bgColor, textColor = "text-gray-800" }) => (
  <div className={`${bgColor} rounded-xl p-3 sm:p-4 shadow-sm w-full min-w-0`}>
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{title}</p>
        <p className={`text-xl sm:text-2xl font-bold ${textColor} truncate`}>{value}</p>
      </div>
      <div className="ml-2 sm:ml-3 flex-shrink-0">{icon}</div>
    </div>
  </div>
);

const AttendanceCard = ({ attendance }) => {
  const statusColor = getStatusColor(attendance.status);
  const relativeDate = getRelativeDate(attendance.date);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 w-full max-w-full">
      <div className="flex items-center justify-between mb-2 min-w-0">
        <div className="flex items-center min-w-0 flex-1">
          <Avatar name={attendance.name} size={36} />
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{attendance.name}</p>
            <p className="text-xs text-gray-500 truncate">ID: {attendance.studentIDNumber}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${statusColor}`}>
          {attendance.status}
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-500 min-w-0">
        <span className="truncate">{relativeDate} ({attendance.date}) at {attendance.time}</span>
      </div>
    </div>
  );
};

// ===== DATA PROCESSING FUNCTIONS =====
const transformAttendanceData = (attendanceRecords, students) => {
  return attendanceRecords.map(record => {
    const studentId = record.studentID || record.faceIndexID;
    const student = students.find(s => s.id === studentId) || record.faceIndex;
    const timestamp = new Date(record.timestamp);
    
    return {
      id: record.id,
      name: student ? student.name : 'Unknown Student',
      studentIDNumber: student ? student.studentIDNumber : 'N/A',
      time: timestamp.toLocaleTimeString('en-US', { hour12: false }),
      date: timestamp.toLocaleDateString('en-US'),
      timestamp: record.timestamp,
      status: record.status === 'PRESENT' ? 'Present' : 'Absent',
      confidence: record.confidence,
      studentId: studentId
    };
  });
};

const generateChartData = (attendanceRecords, students) => {
  const chartData = [];
  const today = new Date();
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const last5Weekdays = [];
  let currentDate = new Date(today);
  
  while (last5Weekdays.length < 5) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      last5Weekdays.unshift({
        date: new Date(currentDate),
        dayName: weekdays[dayOfWeek]
      });
    }
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  last5Weekdays.forEach(dayInfo => {
    const dayAttendance = attendanceRecords.filter(record => {
      const recordDate = new Date(record.timestamp).toLocaleDateString('en-US');
      const targetDate = dayInfo.date.toLocaleDateString('en-US');
      return recordDate === targetDate;
    });

    const presentStudents = new Set();
    dayAttendance.forEach(record => {
      if (record.status === 'Present' || record.status === 'PRESENT') {
        presentStudents.add(record.studentId || record.studentID);
      }
    });

    const totalStudents = students.length || 0;
    const presentCount = presentStudents.size;
    const absentCount = Math.max(0, totalStudents - presentCount);

    chartData.push({
      name: dayInfo.dayName,
      present: presentCount,
      absent: absentCount,
      date: dayInfo.date.toLocaleDateString('en-US')
    });
  });

  return chartData;
};

const generateWeeklyAttendanceData = (attendanceRecords, totalStudents) => {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const now = new Date();
  const currentDay = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  
  return weekdays.map((dayName, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    
    const presentStudents = new Set();
    attendanceRecords.forEach(record => {
      const recordDate = new Date(record.timestamp).toLocaleDateString('en-US');
      if (recordDate === date.toLocaleDateString('en-US') && record.status === 'Present') {
        presentStudents.add(record.studentId);
      }
    });
    
    const present = presentStudents.size;
    const rate = totalStudents > 0 ? Math.round((present / totalStudents) * 100) : 0;
    
    return {
      day: dayName,
      fullDate: date.toLocaleDateString('en-US'),
      present,
      total: totalStudents,
      rate
    };
  });
};

// ===== CHART COMPONENTS =====
const AttendanceChart = ({ data }) => {
  const chartData = data && Array.isArray(data) && data.length > 0 ? data : [
    { name: 'Monday', present: 0, absent: 0 },
    { name: 'Tuesday', present: 0, absent: 0 },
    { name: 'Wednesday', present: 0, absent: 0 },
    { name: 'Thursday', present: 0, absent: 0 },
    { name: 'Friday', present: 0, absent: 0 }
  ];

  const maxValue = Math.max(...chartData.map(item => Math.max(item.present || 0, item.absent || 0)), 5);
  
  // Create Y-axis labels from maxValue down to 0
  const yAxisLabels = [];
  for (let i = maxValue; i >= 0; i--) {
    yAxisLabels.push(i);
  }

  const chartHeight = 280;
  const chartPadding = 20;
  const availableHeight = chartHeight - (chartPadding * 2);

  if (!data || !Array.isArray(data) || data.length === 0 || data.every(item => (item.present || 0) === 0 && (item.absent || 0) === 0)) {
    return (
      <div className="w-full flex items-center justify-center text-gray-500" style={{ height: '380px' }}>
        <div className="text-center">
          <div className="text-lg mb-2">📊</div>
          <div>No attendance data available</div>
          <div className="text-sm">Data will appear when students check in</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: '380px' }}>
      <div className="flex justify-center mb-4 flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span className="text-sm">Present</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span className="text-sm">Absent</span>
        </div>
      </div>
      
      <div className="flex">
        {/* Y-axis labels */}
        <div 
          className="flex flex-col justify-between pr-3 text-right" 
          style={{ 
            width: '40px', 
            height: `${chartHeight}px`,
            paddingTop: `${chartPadding}px`,
            paddingBottom: `${chartPadding + 20}px`
          }}
        >
          {yAxisLabels.map((label, index) => (
            <div key={index} className="text-xs text-gray-500 leading-none">
              {label}
            </div>
          ))}
        </div>
        
        {/* Chart area */}
        <div className="flex-1 relative border-l border-gray-300" style={{ height: `${chartHeight}px` }}>
          {/* Grid lines */}
          <div 
            className="absolute left-0 right-0" 
            style={{ top: `${chartPadding}px`, height: `${availableHeight}px` }}
          >
            {yAxisLabels.map((label, index) => (
              <div 
                key={index} 
                className="absolute w-full border-t border-gray-200"
                style={{ 
                  top: `${(index / (yAxisLabels.length - 1)) * 100}%`
                }}
              />
            ))}
          </div>
          
          {/* Bars */}
          <div 
            className="absolute left-0 right-0 flex items-end justify-around px-4" 
            style={{ 
              top: `${chartPadding}px`, 
              height: `${availableHeight}px`
            }}
          >
            {chartData.map((item, index) => {
              // Calculate actual pixel heights
              const presentHeight = (item.present / maxValue) * availableHeight;
              const absentHeight = (item.absent / maxValue) * availableHeight;
              
              return (
                <div key={index} className="flex items-end gap-1">
                  <div 
                    className="bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer" 
                    style={{ 
                      height: `${Math.max(presentHeight, item.present > 0 ? 4 : 0)}px`,
                      width: '18px'
                    }}
                    title={`Present: ${item.present || 0}`}
                  />
                  <div 
                    className="bg-red-500 rounded-t hover:bg-red-600 transition-colors cursor-pointer" 
                    style={{ 
                      height: `${Math.max(absentHeight, item.absent > 0 ? 4 : 0)}px`,
                      width: '18px'
                    }}
                    title={`Absent: ${item.absent || 0}`}
                  />
                </div>
              );
            })}
          </div>
          
          {/* Day labels */}
          <div 
            className="absolute left-0 right-0 flex justify-around px-4" 
            style={{ bottom: '0px' }}
          >
            {chartData.map((item, index) => (
              <div key={index} className="text-center">
                <span className="text-xs text-gray-600">
                  {item.name ? item.name.substring(0, 3) : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const WeeklyAttendanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No weekly data available
      </div>
    );
  }

  // Responsive dimensions
  const chartWidth = 320; // Smaller for mobile
  const chartHeight = 160; // Smaller for mobile
  const padding = 30; // Reduced padding
  const xStep = (chartWidth - padding * 2) / (data.length - 1);
  const yScale = (chartHeight - padding * 2) / 100;

  const pathData = data.map((item, index) => {
    const x = padding + index * xStep;
    const y = chartHeight - padding - (item.rate * yScale);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-lg font-semibold mb-4">This Week's Attendance Trend</h4>
      
      {/* Mobile-responsive chart container */}
      <div className="w-full overflow-x-auto">
        <div className="flex justify-center min-w-full">
          <div className="w-full max-w-md"> {/* Constrain max width */}
            <svg 
              width="100%" 
              height={chartHeight} 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(value => {
                const y = chartHeight - padding - (value * yScale);
                return (
                  <g key={value}>
                    <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                    <text x={padding - 8} y={y + 3} textAnchor="end" className="text-xs fill-gray-500">
                      {value}%
                    </text>
                  </g>
                );
              })}
              
              {/* Line */}
              <path d={pathData} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Data points */}
              {data.map((item, index) => {
                const x = padding + index * xStep;
                const y = chartHeight - padding - (item.rate * yScale);
                return (
                  <g key={index}>
                    <circle cx={x} cy={y} r="4" fill="#3B82F6" stroke="white" strokeWidth="2" className="cursor-pointer">
                      <title>{`${item.day} (${item.fullDate}): ${item.rate}% (${item.present}/${item.total} students)`}</title>
                    </circle>
                    <text x={x} y={chartHeight - padding + 15} textAnchor="middle" className="text-xs fill-gray-600">
                      {item.day.substring(0, 3)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
      
      {/* Mobile-optimized legend */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-gray-600">
        {data.map((item, index) => (
          <div key={index} className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium">{item.day.substring(0, 3)}</div>
            <div className="text-blue-600 font-semibold text-sm">{item.rate}%</div>
            <div className="text-xs">({item.present}/{item.total})</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== MAIN DASHBOARD COMPONENT =====
const Dashboard = ({ activeTab = 'dashboard' }) => {
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayAttendance, setDisplayAttendance] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [studentsData, attendanceData] = await Promise.all([
          getAllStudents(),
          getAllAttendanceRecords()
        ]);
        
        setStudents(studentsData || []);
        setAttendanceRecords(attendanceData || []);

        const transformedAttendance = transformAttendanceData(attendanceData || [], studentsData || []);
        const generatedChartData = generateChartData(attendanceData || [], studentsData || []);

        setDisplayAttendance(transformedAttendance);
        setChartData(generatedChartData);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setStudents([]);
        setAttendanceRecords([]);
        setDisplayAttendance([]);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateDashboardStats = (students, displayAttendance) => {
    const totalStudents = students.length;
    const today = new Date().toLocaleDateString('en-US');
    const todaysAttendance = displayAttendance.filter(record => record.date === today);
    
    const uniquePresentStudents = new Set(
      todaysAttendance
        .filter(record => record.status === 'Present')
        .map(record => record.studentId)
    );
    const presentToday = uniquePresentStudents.size;
    const absentToday = totalStudents - presentToday;
    
    return { totalStudents, presentToday, absentToday: Math.max(0, absentToday) };
  };

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
    <div className="p-4">
      <div className="max-w-full">
        {activeTab === 'dashboard' && (
          <DashboardContent 
            students={students}
            displayAttendance={displayAttendance}
            chartData={chartData}
            calculateDashboardStats={calculateDashboardStats}
          />
        )}
        {activeTab === 'attendance' && <AttendanceContent displayAttendance={displayAttendance} students={students} />}
        {activeTab === 'reports' && <ReportsContent chartData={chartData} />}
      </div>
    </div>
  );
};

// ===== TAB CONTENT COMPONENTS =====
const DashboardContent = ({ students, displayAttendance, chartData, calculateDashboardStats }) => {
  const stats = calculateDashboardStats(students, displayAttendance);
  const [attendanceFilter, setAttendanceFilter] = useState('all');

  const getFilteredRecentAttendance = () => {
    const today = new Date().toLocaleDateString('en-US');
    switch (attendanceFilter) {
      case 'today': return displayAttendance.filter(attendance => attendance.date === today);
      case 'past': return displayAttendance.filter(attendance => attendance.date !== today);
      default: return displayAttendance;
    }
  };

  const filteredRecentAttendance = getFilteredRecentAttendance();

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents.toString()} 
          icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />} 
          bgColor="bg-blue-100" 
        />
        <StatCard 
          title="Present Today" 
          value={stats.presentToday.toString()} 
          icon={<CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />} 
          bgColor="bg-green-100" 
        />
        <StatCard 
          title="Absent Today" 
          value={stats.absentToday.toString()} 
          icon={<AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />} 
          bgColor="bg-red-100" 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 flex flex-col overflow-hidden" style={{ minHeight: '400px' }}>
          <h3 className="text-base md:text-lg font-semibold mb-4">Attendance Chart</h3>
          <div className="flex-1 relative">
            <AttendanceChart data={chartData} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 w-full h-96 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base md:text-lg font-semibold">Recent Attendances</h3>
            <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'today', 'past'].map(filter => (
              <button
                key={filter}
                onClick={() => setAttendanceFilter(filter)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  attendanceFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'today' ? 'Today' : 'Past Attendances'}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {filteredRecentAttendance.length > 0 ? (
              <div className="space-y-3 w-full overflow-y-auto">
                {filteredRecentAttendance
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .slice(0, 5)
                  .map((attendance) => (
                    <AttendanceCard key={attendance.id} attendance={attendance} />
                  ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center">
                <Clock size={48} className="mb-4 text-gray-400" />
                <div>
                  {attendanceFilter === 'today' 
                    ? "No attendance records for today" 
                    : attendanceFilter === 'past'
                    ? "No past attendance records found"
                    : "No attendance records found"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AttendanceContent = ({ displayAttendance, students }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  
  const weeklyData = generateWeeklyAttendanceData(displayAttendance, students?.length || 0);
  
  const filteredAttendance = displayAttendance
    .filter(attendance => {
      const today = new Date().toLocaleDateString('en-US');
      let dateMatch = true;
      
      if (attendanceFilter === 'today') {
        dateMatch = attendance.date === today;
      } else if (attendanceFilter === 'past') {
        dateMatch = attendance.date !== today;
      }
      
      const searchMatch = attendance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendance.studentIDNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      return dateMatch && searchMatch;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold">Attendance Records</h2>
      </div>

      <WeeklyAttendanceChart data={weeklyData} />

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'today', 'past'].map(filter => (
              <button
                key={filter}
                onClick={() => setAttendanceFilter(filter)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  attendanceFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter === 'all' ? 'All Records' : filter === 'today' ? 'Today' : 'Past Attendances'}
              </button>
            ))}
          </div>
          
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
            />
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          {attendanceFilter === 'today' && 'Showing today\'s attendance records'}
          {attendanceFilter === 'past' && 'Showing past attendance records'}
          {attendanceFilter === 'all' && `Showing ${filteredAttendance.length} attendance records`}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
        <div className="p-4 md:p-6">
          {filteredAttendance.length > 0 ? (
            <div className="space-y-3">
              {filteredAttendance.map((attendance) => (
                <AttendanceCard key={attendance.id} attendance={attendance} />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-12">
              <Clock size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Attendance Records</h3>
              <p>
                {attendanceFilter === 'today' 
                  ? "No attendance records found for today." 
                  : attendanceFilter === 'past'
                  ? "No past attendance records found."
                  : searchTerm 
                  ? `No records found matching "${searchTerm}".`
                  : "No attendance records found. Records will appear here once students check in."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReportsContent = ({ chartData }) => {
  const reports = [
    { title: 'Daily Attendance', description: 'Complete daily records', icon: Calendar },
    { title: 'Weekly Summary', description: 'Weekly statistics', icon: Calendar },
    { title: 'Monthly Report', description: 'Monthly trends', icon: Calendar },
    { title: 'Absence Report', description: 'Details of absences', icon: AlertTriangle },
    { title: 'Student Overview', description: 'Individual student reports', icon: Users },
    { title: 'Custom Report', description: 'Create customized report', icon: Download }
  ];

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold">Attendance Reports</h2>
        <div>
          <button className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center">
            <Download className="mr-2 h-5 w-5" />
            Export Data
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 overflow-hidden w-full">
        <h3 className="text-base md:text-lg font-semibold mb-4">Weekly Attendance Overview</h3>
        <AttendanceChart data={chartData} />
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 w-full">
        <h3 className="text-base md:text-lg font-semibold mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report, index) => (
            <div key={index} className="border rounded-lg p-3 md:p-4 flex items-start hover:bg-blue-50 cursor-pointer w-full">
              <div className="p-2 md:p-3 bg-blue-100 rounded-lg mr-3 md:mr-4 flex-shrink-0">
                <report.icon />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm md:text-base font-medium truncate">{report.title}</h4>
                <p className="text-xs md:text-sm text-gray-600 truncate">{report.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;