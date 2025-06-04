/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createFaceIndex = /* GraphQL */ `
  mutation CreateFaceIndex(
    $input: CreateFaceIndexInput!
    $condition: ModelFaceIndexConditionInput
  ) {
    createFaceIndex(input: $input, condition: $condition) {
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
export const updateFaceIndex = /* GraphQL */ `
  mutation UpdateFaceIndex(
    $input: UpdateFaceIndexInput!
    $condition: ModelFaceIndexConditionInput
  ) {
    updateFaceIndex(input: $input, condition: $condition) {
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
export const deleteFaceIndex = /* GraphQL */ `
  mutation DeleteFaceIndex(
    $input: DeleteFaceIndexInput!
    $condition: ModelFaceIndexConditionInput
  ) {
    deleteFaceIndex(input: $input, condition: $condition) {
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
export const createAttendance = /* GraphQL */ `
  mutation CreateAttendance(
    $input: CreateAttendanceInput!
    $condition: ModelAttendanceConditionInput
  ) {
    createAttendance(input: $input, condition: $condition) {
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
export const updateAttendance = /* GraphQL */ `
  mutation UpdateAttendance(
    $input: UpdateAttendanceInput!
    $condition: ModelAttendanceConditionInput
  ) {
    updateAttendance(input: $input, condition: $condition) {
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
export const deleteAttendance = /* GraphQL */ `
  mutation DeleteAttendance(
    $input: DeleteAttendanceInput!
    $condition: ModelAttendanceConditionInput
  ) {
    deleteAttendance(input: $input, condition: $condition) {
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
