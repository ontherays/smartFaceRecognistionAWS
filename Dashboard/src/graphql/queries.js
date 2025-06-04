/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getFaceIndex = /* GraphQL */ `
  query GetFaceIndex($StudentID: String!) {
    getFaceIndex(StudentID: $StudentID) {
      StudentID
      FaceID
      ImageID
      Name
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listFaceIndices = /* GraphQL */ `
  query ListFaceIndices(
    $StudentID: String
    $filter: ModelFaceIndexFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFaceIndices(
      StudentID: $StudentID
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        StudentID
        FaceID
        ImageID
        Name
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getAttendance = /* GraphQL */ `
  query GetAttendance($StudentID: String!, $Date: String!) {
    getAttendance(StudentID: $StudentID, Date: $Date) {
      StudentID
      Date
      Image
      Name
      Time
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listAttendances = /* GraphQL */ `
  query ListAttendances(
    $StudentID: String
    $Date: ModelStringKeyConditionInput
    $filter: ModelAttendanceFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listAttendances(
      StudentID: $StudentID
      Date: $Date
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        StudentID
        Date
        Image
        Name
        Time
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
