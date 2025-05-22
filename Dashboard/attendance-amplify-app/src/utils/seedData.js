import { addStudent, addAttendanceRecord, addAlert } from '../services/api';

// Sample student data
const sampleStudents = [
  { name: 'John Smith', studentIDNumber: 'STU001' },
  { name: 'Maria Garcia', studentIDNumber: 'STU002' },
  { name: 'Ahmed Khan', studentIDNumber: 'STU003' },
  { name: 'Sarah Johnson', studentIDNumber: 'STU004' },
  { name: 'Li Wei', studentIDNumber: 'STU005' },
  { name: 'Olivia Brown', studentIDNumber: 'STU006' },
  { name: 'Carlos Mendez', studentIDNumber: 'STU007' },
  { name: 'Emma Wilson', studentIDNumber: 'STU008' },
  { name: 'David Lee', studentIDNumber: 'STU009' },
  { name: 'Sophie Chen', studentIDNumber: 'STU010' }
];

// Generate random attendance records
const generateAttendanceRecords = (students) => {
  const records = [];
  const statuses = ['PRESENT', 'LATE', 'ABSENT'];
  
  students.forEach(student => {
    // Create 3-5 attendance records for each student over the past week
    const numRecords = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < numRecords; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const hours = Math.floor(Math.random() * 3) + 8; // Between 8-10 AM
      const minutes = Math.floor(Math.random() * 60);
      
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - daysAgo);
      timestamp.setHours(hours, minutes, 0, 0);
      
      records.push({
        studentID: student.id,
        timestamp: timestamp.toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        confidence: Math.random() * 0.3 + 0.7 // Between 0.7 and 1.0
      });
    }
  });
  
  return records;
};

// Generate sample alerts (only unknown face alerts)
const generateAlerts = () => {
  const alertMessages = [
    'Unrecognized face detected during attendance',
  ];
  
  const alerts = [];
  
  // Generate 4-6 unknown face alerts over the past few days
  const numAlerts = Math.floor(Math.random() * 3) + 4;
  
  for (let i = 0; i < numAlerts; i++) {
    const daysAgo = Math.floor(Math.random() * 3);
    const hours = Math.floor(Math.random() * 12) + 8; // Between 8 AM - 8 PM
    const minutes = Math.floor(Math.random() * 60);
    
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(hours, minutes, 0, 0);
    
    alerts.push({
      message: alertMessages,
      timestamp: timestamp.toISOString(),
      alertType: 'UNKNOWN_FACE', // Only one type now
      acknowledged: Math.random() > 0.6 // Slightly less likely to be acknowledged
    });
  }
  
  return alerts;
};

// Main function to seed the database
export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Step 1: Add students
    console.log('Adding students...');
    const addedStudents = [];
    for (const studentData of sampleStudents) {
      try {
        const student = await addStudent(studentData);
        addedStudents.push(student);
        console.log(`Added student: ${student.name} (ID: ${student.studentIDNumber})`);
      } catch (error) {
        console.error(`Error adding student ${studentData.name}:`, error);
      }
    }
    
    // Wait a bit to ensure students are saved
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Add attendance records
    console.log('Adding attendance records...');
    const attendanceRecords = generateAttendanceRecords(addedStudents);
    for (const record of attendanceRecords) {
      try {
        await addAttendanceRecord(record);
        console.log(`Added attendance record for student ${record.studentID}`);
      } catch (error) {
        console.error('Error adding attendance record:', error);
      }
    }
    
    // Step 3: Add alerts (unknown face only)
    console.log('Adding unknown face alerts...');
    const alerts = generateAlerts();
    for (const alert of alerts) {
      try {
        await addAlert(alert);
        console.log(`Added alert: ${alert.message}`);
      } catch (error) {
        console.error('Error adding alert:', error);
      }
    }
    
    console.log('Database seeding completed successfully!');
    console.log(`Added ${addedStudents.length} students, ${attendanceRecords.length} attendance records, and ${alerts.length} unknown face alerts.`);
    
    return {
      students: addedStudents.length,
      attendanceRecords: attendanceRecords.length,
      alerts: alerts.length
    };
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Function to clear all data (use with caution!)
export const clearDatabase = async () => {
  console.log('Warning: clearDatabase function is not implemented for safety reasons.');
  console.log('To clear data, use the AWS Console or Amplify Admin UI.');
};

// Function to check if database has data
export const checkDatabaseStatus = async () => {
  try {
    const { getAllStudents, getAllAttendanceRecords, getAllAlerts } = await import('../services/api');
    
    const [students, attendance, alerts] = await Promise.all([
      getAllStudents(),
      getAllAttendanceRecords(),
      getAllAlerts()
    ]);
    
    return {
      hasData: students.length > 0 || attendance.length > 0 || alerts.length > 0,
      counts: {
        students: students.length,
        attendance: attendance.length,
        alerts: alerts.length
      }
    };
  } catch (error) {
    console.error('Error checking database status:', error);
    return { hasData: false, counts: { students: 0, attendance: 0, alerts: 0 } };
  }
};