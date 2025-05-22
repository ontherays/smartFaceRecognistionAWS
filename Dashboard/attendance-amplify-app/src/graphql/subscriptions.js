/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateStudent = /* GraphQL */ `
  subscription OnCreateStudent($filter: ModelSubscriptionStudentFilterInput) {
    onCreateStudent(filter: $filter) {
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
export const onUpdateStudent = /* GraphQL */ `
  subscription OnUpdateStudent($filter: ModelSubscriptionStudentFilterInput) {
    onUpdateStudent(filter: $filter) {
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
export const onDeleteStudent = /* GraphQL */ `
  subscription OnDeleteStudent($filter: ModelSubscriptionStudentFilterInput) {
    onDeleteStudent(filter: $filter) {
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
export const onCreateAttendanceRecord = /* GraphQL */ `
  subscription OnCreateAttendanceRecord(
    $filter: ModelSubscriptionAttendanceRecordFilterInput
  ) {
    onCreateAttendanceRecord(filter: $filter) {
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
export const onUpdateAttendanceRecord = /* GraphQL */ `
  subscription OnUpdateAttendanceRecord(
    $filter: ModelSubscriptionAttendanceRecordFilterInput
  ) {
    onUpdateAttendanceRecord(filter: $filter) {
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
export const onDeleteAttendanceRecord = /* GraphQL */ `
  subscription OnDeleteAttendanceRecord(
    $filter: ModelSubscriptionAttendanceRecordFilterInput
  ) {
    onDeleteAttendanceRecord(filter: $filter) {
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
export const onCreateAlert = /* GraphQL */ `
  subscription OnCreateAlert($filter: ModelSubscriptionAlertFilterInput) {
    onCreateAlert(filter: $filter) {
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
export const onUpdateAlert = /* GraphQL */ `
  subscription OnUpdateAlert($filter: ModelSubscriptionAlertFilterInput) {
    onUpdateAlert(filter: $filter) {
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
export const onDeleteAlert = /* GraphQL */ `
  subscription OnDeleteAlert($filter: ModelSubscriptionAlertFilterInput) {
    onDeleteAlert(filter: $filter) {
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
