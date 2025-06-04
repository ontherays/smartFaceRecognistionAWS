// src/utils/databaseStatus.js - Simplified database status checking only

import { getAllStudents, getAllAttendanceRecords } from '../services/api';

// Function to check if database has data (status monitoring only)
export const checkDatabaseStatus = async () => {
  try {
    console.log('🔍 Checking database status...');
    
    const [students, attendance] = await Promise.all([
      getAllStudents(),
      getAllAttendanceRecords()
    ]);
    
    console.log(`Database status: ${students.length} students, ${attendance.length} attendance records`);
    
    return {
      hasData: students.length > 0 || attendance.length > 0,
      counts: {
        students: students.length,
        attendance: attendance.length
      },
      details: {
        students: students.slice(0, 10).map(s => ({
          id: s.studentIDNumber,
          name: s.name
        })),
        recentAttendance: attendance.slice(0, 5).map(a => ({
          student: a.name,
          date: a.date,
          time: a.time
        }))
      }
    };
  } catch (error) {
    console.error('❌ Error checking database status:', error);
    return { 
      hasData: false, 
      counts: { students: 0, attendance: 0 },
      error: error.message
    };
  }
};