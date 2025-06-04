// src/services/api.js - FIXED to match actual table structure

import { generateClient } from 'aws-amplify/api';

const client = generateClient();

// FIXED: Only query fields that actually exist in your imported tables
const listFaceIndices = /* GraphQL */ `
  query ListFaceIndices {
    listFaceIndices {
      items {
        StudentID
        FaceID
        ImageID
        Name
      }
    }
  }
`;

// FIXED: Only query fields that actually exist
const listAttendances = /* GraphQL */ `
  query ListAttendances {
    listAttendances {
      items {
        StudentID
        Date
        Image
        Name
        Time
      }
    }
  }
`;

// FIXED: Mutations for existing table structure
const createFaceIndex = /* GraphQL */ `
  mutation CreateFaceIndex($input: CreateFaceIndexInput!) {
    createFaceIndex(input: $input) {
      StudentID
      FaceID
      ImageID
      Name
    }
  }
`;

const createAttendance = /* GraphQL */ `
  mutation CreateAttendance($input: CreateAttendanceInput!) {
    createAttendance(input: $input) {
      StudentID
      Date
      Image
      Name
      Time
    }
  }
`;

// Debug function to test GraphQL connection
export const testGraphQLConnection = async () => {
  try {
    console.log('🔍 Testing GraphQL connection with minimal fields...');
    const result = await client.graphql({ query: listFaceIndices });
    console.log('✅ GraphQL connection successful:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ GraphQL connection failed:', error);
    
    // Log detailed error information
    if (error.errors) {
      console.error('GraphQL Errors:');
      error.errors.forEach((err, index) => {
        console.error(`Error ${index + 1}:`, err.message);
        console.error(`Path:`, err.path);
        console.error(`Extensions:`, err.extensions);
      });
    }
    
    return { success: false, error: error.message, details: error };
  }
};

// FIXED: Student operations without timestamp fields
export const getAllStudents = async () => {
  try {
    console.log('👥 Fetching all students from FaceIndex...');
    const result = await client.graphql({ query: listFaceIndices });
    
    console.log('Raw GraphQL response:', JSON.stringify(result, null, 2));
    
    if (!result.data?.listFaceIndices?.items) {
      console.warn('⚠️ No items found in listFaceIndices result');
      return [];
    }
    
    // Transform FaceIndex items to student format
    const students = result.data.listFaceIndices.items.map(item => {
      console.log('Processing student item:', item);
      return {
        id: item.StudentID, // Use StudentID as id
        name: item.Name,
        studentIDNumber: item.StudentID,
        faceID: item.FaceID,
        imageID: item.ImageID,
        // Remove createdAt/updatedAt since they don't exist in imported tables
      };
    });
    
    console.log(`✅ Successfully processed ${students.length} students`);
    return students;
    
  } catch (error) {
    console.error('❌ Error fetching students:', error);
    
    // Enhanced error logging for debugging
    if (error.errors) {
      console.error('🔍 GraphQL field errors detected:');
      error.errors.forEach((err, index) => {
        console.error(`  ${index + 1}. ${err.message}`);
        if (err.path) {
          console.error(`     Path: ${err.path.join(' -> ')}`);
        }
      });
      console.error('💡 This usually means the query is requesting fields that don\'t exist in the table');
    }
    
    throw error;
  }
};

export const addStudent = async (studentData) => {
  try {
    console.log('➕ Adding student to FaceIndex:', studentData);
    
    const inputData = {
      StudentID: studentData.studentIDNumber || studentData.StudentID || generateStudentID(),
      Name: studentData.name,
      FaceID: studentData.faceID || `face_${Date.now()}`, // Use provided or generate
      ImageID: studentData.imageID || `img_${Date.now()}` // Use provided or generate
    };
    
    // Validate required fields
    if (!inputData.Name || !inputData.StudentID) {
      throw new Error('Name and StudentID are required');
    }
    
    console.log('📤 Sending to GraphQL:', inputData);
    
    const result = await client.graphql({
      query: createFaceIndex,
      variables: { input: inputData }
    });
    
    console.log('✅ Student added successfully:', result.data.createFaceIndex);
    
    // Transform back to student format
    const faceIndexItem = result.data.createFaceIndex;
    return {
      id: faceIndexItem.StudentID,
      name: faceIndexItem.Name,
      studentIDNumber: faceIndexItem.StudentID,
      faceID: faceIndexItem.FaceID,
      imageID: faceIndexItem.ImageID
    };
  } catch (error) {
    console.error('❌ Error creating student:', error);
    
    if (error.errors) {
      console.error('GraphQL creation errors:');
      error.errors.forEach(err => console.error(`  - ${err.message}`));
    }
    
    throw error;
  }
};

// FIXED: Attendance operations for composite key table
export const getAllAttendanceRecords = async () => {
  try {
    console.log('📝 Fetching all attendance records...');
    const result = await client.graphql({ query: listAttendances });
    
    console.log('Raw attendance response:', JSON.stringify(result, null, 2));
    
    if (!result.data?.listAttendances?.items) {
      console.warn('⚠️ No items found in listAttendances result');
      return [];
    }
    
    // Transform attendance items - create virtual ID from composite key
    const attendanceRecords = result.data.listAttendances.items.map(item => ({
      id: `${item.StudentID}_${item.Date}`, // Create virtual ID from composite key
      studentID: item.StudentID,
      timestamp: `${item.Date}T${item.Time}.000Z`, // Combine date and time
      status: 'PRESENT', // Default status since not in schema
      confidence: 0.95, // Default confidence
      name: item.Name,
      date: item.Date,
      time: item.Time,
      image: item.Image
    }));
    
    console.log(`✅ Successfully processed ${attendanceRecords.length} attendance records`);
    return attendanceRecords;
    
  } catch (error) {
    console.error('❌ Error fetching attendance records:', error);
    
    if (error.errors) {
      console.error('Attendance fetch errors:');
      error.errors.forEach(err => console.error(`  - ${err.message}`));
    }
    
    return []; // Return empty array instead of throwing to prevent dashboard crashes
  }
};

export const addAttendanceRecord = async (attendanceData) => {
  try {
    console.log('📝 Adding attendance record:', attendanceData);
    
    const inputData = {
      StudentID: attendanceData.studentID || attendanceData.StudentID,
      Name: attendanceData.name || attendanceData.Name || 'Unknown',
      Date: attendanceData.date || attendanceData.Date || new Date().toISOString().split('T')[0],
      Time: attendanceData.time || attendanceData.Time || new Date().toTimeString().split(' ')[0],
      Image: attendanceData.image || attendanceData.Image || `capture_${Date.now()}.jpg`
    };
    
    console.log('📤 Mapped input data:', inputData);
    
    // Validate required fields for GraphQL schema
    if (!inputData.StudentID || !inputData.Name || !inputData.Date || !inputData.Time) {
      throw new Error('Missing required fields: StudentID, Name, Date, and Time are required');
    }
    
    // Validate date and time formats
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
    
    if (!dateRegex.test(inputData.Date)) {
      throw new Error(`Invalid date format: ${inputData.Date}. Expected YYYY-MM-DD`);
    }
    
    if (!timeRegex.test(inputData.Time)) {
      throw new Error(`Invalid time format: ${inputData.Time}. Expected HH:MM:SS`);
    }
    
    const result = await client.graphql({
      query: createAttendance,
      variables: { input: inputData }
    });
    
    console.log('✅ Attendance record added successfully:', result.data.createAttendance);
    
    // Transform back to expected format
    const attendanceItem = result.data.createAttendance;
    return {
      id: `${attendanceItem.StudentID}_${attendanceItem.Date}`, // Virtual ID from composite key
      studentID: attendanceItem.StudentID,
      timestamp: `${attendanceItem.Date}T${attendanceItem.Time}:00.000Z`,
      status: 'PRESENT',
      confidence: 0.95,
      name: attendanceItem.Name,
      date: attendanceItem.Date,
      time: attendanceItem.Time,
      image: attendanceItem.Image
    };
  } catch (error) {
    console.error('❌ Error creating attendance record:', error);
    console.error('Failed input data:', attendanceData);
    
    if (error.errors) {
      console.error('Attendance creation errors:');
      error.errors.forEach(err => console.error(`  - ${err.message}`));
    }
    
    throw error;
  }
};

// Helper function to generate student ID
const generateStudentID = () => {
  return 'STU' + Date.now().toString().slice(-6);
};