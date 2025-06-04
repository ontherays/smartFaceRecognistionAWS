## **Test Plan and Matrix: Smart Auto Attendance System**

**Project Overview**
A face recognition–based attendance system using Raspberry Pi 4, PiCamera, and IR sensor integrated with AWS Rekognition, Lambda, S3, and DynamoDB. The system captures images on motion detection, uploads them to S3, and identifies individuals for attendance logging.

---

### **Functional Modules and Test Cases**

---

### ✅ 1. **IR Sensor Trigger & Motion Detection**

| **Test Case** | **Description**                                                                          |
| ------------- | ---------------------------------------------------------------------------------------- |
| **IR-001**    | Verify IR sensor correctly detects motion within its detection range. |
| **IR-002**    | Verify PiCamera is triggered immediately upon motion detection.                          |

---

### ✅ 2. **Image Capture Using PiCamera**

| **Test Case** | **Description**                                                         |
| ------------- | ----------------------------------------------------------------------- |
| **CAM-001**   | Ensure PiCamera captures a clear image upon motion detection.           |
| **CAM-002**   | Validate image timestamp and filename are correctly generated.          |

---

### ✅ 3. **S3 Upload Logic**

| **Test Case** | **Description**                                                                  |
| ------------- | -------------------------------------------------------------------------------- |
| **S3-001**    | Confirm image is uploaded to correct S3 bucket (e.g., `face-attendance-bucket`). |
| **S3-002**    | Validate proper folder path in S3 (`attendance/` or `registered/`).              |
| **S3-003**    | Simulate network disconnection and test retry/resume logic.                      |
| **S3-004**    | Verify S3 object metadata includes timestamp and device ID if applicable.        |

---

### ✅ 4. **Face Indexing via AWS Rekognition**

| **Test Case** | **Description**                                                                     |
| ------------- | ----------------------------------------------------------------------------------- |
| **REK-001**   | Validate registered image is indexed correctly using `ExternalImageId = StudentID`. |
| **REK-002**   | Confirm images outside quality bounds (e.g., blurry) are rejected or warned.        |
| **REK-003**   | Attempt duplicate registrations – ensure deduplication logic or overwrite alert.    |

---

### ✅ 5. **Attendance Recognition (SearchFacesByImage)**

| **Test Case** | **Description**                                                               |
| ------------- | ----------------------------------------------------------------------------- |
| **REK-101**   | Validate match accuracy using high-quality face input.                        |
| **REK-102**   | Simulate an unregistered face – system should return “no match.”              |
| **REK-103**   | Validate Rekognition returns `ExternalImageId` for matched face.              |

---

### ✅ 6. **Lambda Logic (Recognition + Logging)**

| **Test Case** | **Description**                                                                                            |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| **LMB-001**   | Trigger Lambda on S3 `PUT` event – verify execution.                                                       |
| **LMB-002**   | Confirm DynamoDB `Attendance` table is updated with correct fields: `StudentID`, `Date`, `TimeIn`, `Name`. |
| **LMB-003**   | Inject malformed S3 key – confirm Lambda handles gracefully (try-catch).                                   |
| **LMB-004**   | Test with image that returns multiple matches – ensure top confidence face is selected.                    |

---

### ✅ 7. **DynamoDB Tables**

#### FaceIndex Table

| **Test Case** | **Description**                                                             |
| ------------- | --------------------------------------------------------------------------- |
| **DDB-001**   | Ensure face registration creates new entry: `StudentID`, `Name`, `ImageId`. |
| **DDB-002**   | Validate schema integrity under high volume of entries.                     |

#### Attendance Table

| **Test Case** | **Description**                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| **DDB-101**   | Confirm correct timestamp logging format.                                                                           |
| **DDB-102**   | Attempt repeated entry for same student in short time – ensure proper deduplication or configurable time threshold. |

---

### ✅ 8. **Edge Display / Feedback**

| **Test Case** | **Description**                                                         |
| ------------- | ----------------------------------------------------------------------- |
| **DSP-001**   | Display "Attendance Marcked for {Name}" on successful match.                           |
| **DSP-002**   | Display "Face not recognized" on failure.                               |
| **DSP-003**   | Test screen refresh or scrolling when multiple people pass in sequence. |

---

### ✅ 8. **Test Scenarios and Cases**

| **Test Case ID** | **Scenario**                                     | **Steps**                                                                                               | **Expected Result**                                                                 |
| ---------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| SNS-01           | Send test message to student topic               | - Use AWS CLI or console to publish message to `AttendanceNotificationTopic`                            | Student email should receive the test message                                       |
| SNS-04           | Send test message to admin topic                 | - Use AWS CLI or console to publish message to `AdminAlertTopic`                                        | Admin email should receive the test message                                         |
| SNS-05           | Verify notification after attendance marked      | - Simulate a motion detection and known face capture <br> - Check student email                         | Student should receive attendance confirmation with name, ID, timestamp             |
| SNS-06           | Verify no duplicate notification for same day    | - Repeat recognition for same student on same date                                                      | SNS should **not** send another attendance notification                             |
| SNS-07           | Verify notification after new registration       | - Capture unrecognized face <br> - Complete registration via terminal prompt                            | Both admin and student should receive SNS alerts with registration and attendance   |
| SNS-08           | Simulate SNS failure (disable topic temporarily) | - Turn off topic subscription or use invalid ARN <br> - Trigger attendance                              | Code should fail gracefully with a printed error message                            |
| SNS-09           | Confirm message formatting                       | - Review SNS email content                                                                              | Message should include name, ID, date, time, and relevant status info               |



## Integration Testing Matrix

| Component       | IR Sensor | PiCamera | S3 Upload | Lambda | Rekognition | DynamoDB | IAM Policy|
| --------------- | --------- | -------- | --------- | ------ | ----------- | -------- | -------- |
| IR Sensor       | ✅         | ✅        | –         | –      | –           | –        | –        |
| PiCamera        | –         | ✅        | ✅         | –      | –           | –        | –        |
| S3 Upload       | –         | –        | ✅         | ✅      | ✅           | –        |  ✅    |
| Lambda Function | –         | –        | –         | ✅      | ✅           | ✅        | ✅      |
| Rekognition     | –         | –        | –         | –      | ✅           | ✅        | ✅      |
| DynamoDB        | –         | –        | –         | –      | –           | ✅        |  ✅      |
| SNS             | –         | –        | –         | –      | –           | ✅        |   ✅     |

---

## Final Acceptance Criteria

* Minimum 90% face recognition accuracy under real lighting
* Attendance logs must be created for 95% of valid entries
* System must recover gracefully from network failure
* All AWS services should operate within Free Tier or budgeted limits during testing


## Futurre Enhancements


---

## **Security & Permissions Testing**

| **Test Case** | **Description**                                                                      |
| ------------- | ------------------------------------------------------------------------------------ |
| **SEC-001**   | Verify S3 bucket policies restrict public read/write.                                |
| **SEC-002**   | Ensure IAM roles allow only intended access: Lambda → Rekognition, Rekognition → S3. |
| **SEC-003**   | Validate that logs do not contain PII unless encrypted or masked.                    |

---

## Performance Testing

| **Test Case** | **Description**                                                 |
| ------------- | --------------------------------------------------------------- |
| **PERF-001**  | Time from motion detection to attendance log creation < 5 sec.  |
| **PERF-002**  | Handle 10 consecutive triggers in < 1 min without error.        |
| **PERF-003**  | Lambda concurrency scaling test (up to 5 simultaneous uploads). |



