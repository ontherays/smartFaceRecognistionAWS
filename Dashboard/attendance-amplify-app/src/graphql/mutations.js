/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createStudent = /* GraphQL */ `
  mutation CreateStudent(
    $input: CreateStudentInput!
    $condition: ModelStudentConditionInput
  ) {
    createStudent(input: $input, condition: $condition) {
      id
      name
      studentIDNumber
      createdAt
      attendanceRecords {
        nextToken
        __typename
      }
      updatedAt
      __typename
    }
  }
`;
export const updateStudent = /* GraphQL */ `
  mutation UpdateStudent(
    $input: UpdateStudentInput!
    $condition: ModelStudentConditionInput
  ) {
    updateStudent(input: $input, condition: $condition) {
      id
      name
      studentIDNumber
      createdAt
      attendanceRecords {
        nextToken
        __typename
      }
      updatedAt
      __typename
    }
  }
`;
export const deleteStudent = /* GraphQL */ `
  mutation DeleteStudent(
    $input: DeleteStudentInput!
    $condition: ModelStudentConditionInput
  ) {
    deleteStudent(input: $input, condition: $condition) {
      id
      name
      studentIDNumber
      createdAt
      attendanceRecords {
        nextToken
        __typename
      }
      updatedAt
      __typename
    }
  }
`;
export const createAttendanceRecord = /* GraphQL */ `
  mutation CreateAttendanceRecord(
    $input: CreateAttendanceRecordInput!
    $condition: ModelAttendanceRecordConditionInput
  ) {
    createAttendanceRecord(input: $input, condition: $condition) {
      id
      studentID
      student {
        id
        name
        studentIDNumber
        createdAt
        updatedAt
        __typename
      }
      timestamp
      status
      confidence
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAttendanceRecord = /* GraphQL */ `
  mutation UpdateAttendanceRecord(
    $input: UpdateAttendanceRecordInput!
    $condition: ModelAttendanceRecordConditionInput
  ) {
    updateAttendanceRecord(input: $input, condition: $condition) {
      id
      studentID
      student {
        id
        name
        studentIDNumber
        createdAt
        updatedAt
        __typename
      }
      timestamp
      status
      confidence
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAttendanceRecord = /* GraphQL */ `
  mutation DeleteAttendanceRecord(
    $input: DeleteAttendanceRecordInput!
    $condition: ModelAttendanceRecordConditionInput
  ) {
    deleteAttendanceRecord(input: $input, condition: $condition) {
      id
      studentID
      student {
        id
        name
        studentIDNumber
        createdAt
        updatedAt
        __typename
      }
      timestamp
      status
      confidence
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAlert = /* GraphQL */ `
  mutation CreateAlert(
    $input: CreateAlertInput!
    $condition: ModelAlertConditionInput
  ) {
    createAlert(input: $input, condition: $condition) {
      id
      message
      timestamp
      alertType
      imageUrl
      acknowledged
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAlert = /* GraphQL */ `
  mutation UpdateAlert(
    $input: UpdateAlertInput!
    $condition: ModelAlertConditionInput
  ) {
    updateAlert(input: $input, condition: $condition) {
      id
      message
      timestamp
      alertType
      imageUrl
      acknowledged
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAlert = /* GraphQL */ `
  mutation DeleteAlert(
    $input: DeleteAlertInput!
    $condition: ModelAlertConditionInput
  ) {
    deleteAlert(input: $input, condition: $condition) {
      id
      message
      timestamp
      alertType
      imageUrl
      acknowledged
      createdAt
      updatedAt
      __typename
    }
  }
`;
