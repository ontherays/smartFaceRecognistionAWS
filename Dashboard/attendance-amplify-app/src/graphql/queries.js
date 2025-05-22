/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getStudent = /* GraphQL */ `
  query GetStudent($id: ID!) {
    getStudent(id: $id) {
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
export const listStudents = /* GraphQL */ `
  query ListStudents(
    $filter: ModelStudentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listStudents(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        studentIDNumber
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getAttendanceRecord = /* GraphQL */ `
  query GetAttendanceRecord($id: ID!) {
    getAttendanceRecord(id: $id) {
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
export const listAttendanceRecords = /* GraphQL */ `
  query ListAttendanceRecords(
    $filter: ModelAttendanceRecordFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAttendanceRecords(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        studentID
        timestamp
        status
        confidence
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getAlert = /* GraphQL */ `
  query GetAlert($id: ID!) {
    getAlert(id: $id) {
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
export const listAlerts = /* GraphQL */ `
  query ListAlerts(
    $filter: ModelAlertFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAlerts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const attendanceRecordsByStudentID = /* GraphQL */ `
  query AttendanceRecordsByStudentID(
    $studentID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelAttendanceRecordFilterInput
    $limit: Int
    $nextToken: String
  ) {
    attendanceRecordsByStudentID(
      studentID: $studentID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        studentID
        timestamp
        status
        confidence
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
