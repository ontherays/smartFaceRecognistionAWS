// src/utils/seedData.js - FIXED for actual DynamoDB structure

import { addStudent, addAttendanceRecord, getAllStudents, getAllAttendanceRecords } from '../services/api';

// Sample student data matching your actual team structure
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

// Utility function to generate realistic attendance times
const generateAttendanceTime = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  // Set realistic class times (8 AM to 10 AM)
  const hour = 8 + Math.floor(Math.random() * 3);
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  
  date.setHours(hour, minute, second, 0);
  
  return {
    date: date.toISOString().split('T')[0], // YYYY-MM-DD format
    time: date.toTimeString().split(' ')[0]  // HH:MM:SS format
  };
};

// FIXED: Main function to seed the database working with existing data
export const seedDatabase = async () => {
  try {
    console.log('🚀 Starting database seeding...');
    
    let addedStudentCount = 0;
    let addedAttendanceCount = 0;
    
    // Step 1: Get existing students
    console.log('📊 Checking existing students...');
    const existingStudents = await getAllStudents();
    console.log(`Found ${existingStudents.length} existing students:`, 
      existingStudents.map(s => `${s.name} (${s.studentIDNumber})`));
    
    // Step 2: Add new students (skip if they already exist)
    console.log('👥 Adding new students...');
    const allStudents = [...existingStudents]; // Start with existing
    
    for (const studentData of sampleStudents) {
      try {
        // Check if student already exists
        const exists = existingStudents.find(s => 
          s.studentIDNumber === studentData.studentIDNumber || 
          s.name === studentData.name
        );
        
        if (exists) {
          console.log(`⚠️ Student ${studentData.name} already exists, skipping...`);
          continue;
        }
        
        const student = await addStudent(studentData);
        allStudents.push(student);
        addedStudentCount++;
        console.log(`✅ Added student: ${student.name} (ID: ${student.studentIDNumber})`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Error adding student ${studentData.name}:`, error);
      }
    }
    
    // Step 3: Check existing attendance
    console.log('📝 Checking existing attendance records...');
    const existingAttendance = await getAllAttendanceRecords();
    console.log(`Found ${existingAttendance.length} existing attendance records`);
    
    // Step 4: Add attendance records for all students
    console.log('📝 Adding attendance records...');
    
    for (const student of allStudents.slice(0, 5)) { // Limit to first 5 to avoid too many records
      try {
        // Generate 2-3 attendance records per student
        const numRecords = Math.floor(Math.random() * 2) + 2;
        
        for (let i = 0; i < numRecords; i++) {
          const daysAgo = Math.floor(Math.random() * 7);
          const timeInfo = generateAttendanceTime(daysAgo);
          
          // FIXED: Check if this exact attendance record already exists
          const existingRecord = existingAttendance.find(att => 
            att.studentID === student.studentIDNumber && 
            att.date === timeInfo.date
          );
          
          if (existingRecord) {
            console.log(`⚠️ Attendance for ${student.name} on ${timeInfo.date} already exists, skipping...`);
            continue;
          }
          
          const attendanceData = {
            studentID: student.studentIDNumber,
            name: student.name,
            date: timeInfo.date,
            time: timeInfo.time,
            image: `capture_${student.studentIDNumber}_${Date.now()}_${i}.jpg`
          };
          
          console.log(`Creating attendance: ${student.name} on ${timeInfo.date} at ${timeInfo.time}`);
          
          await addAttendanceRecord(attendanceData);
          addedAttendanceCount++;
          
          // Delay between records to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Delay between students
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error(`❌ Error adding attendance for ${student.name}:`, error);
      }
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - New students added: ${addedStudentCount}`);
    console.log(`   - New attendance records added: ${addedAttendanceCount}`);
    console.log(`   - Total students in system: ${allStudents.length}`);
    
    return {
      students: addedStudentCount,
      attendanceRecords: addedAttendanceCount,
      totalStudents: allStudents.length
    };
    
  } catch (error) {
    console.error('💥 Error seeding database:', error);
    throw error;
  }
};

// Function to clear all data (use with caution!)
export const clearDatabase = async () => {
  console.log('⚠️ Warning: clearDatabase function is not implemented for safety reasons.');
  console.log('To clear data, use the AWS Console or Amplify Admin UI.');
};

// FIXED: Function to check if database has data
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
        students: students.map(s => ({
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