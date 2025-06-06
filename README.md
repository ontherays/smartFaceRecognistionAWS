# smartFaceRecognistionAWS
Repository for Smart Attendance System using Face Recognition.

## **Smart Attendance System Using Raspberry Pi and AWS**

 ### **Project Overview**
 
The Smart Attendance System is a fully integrated, IoT- and cloud-powered face recognition solution designed to automate student attendance tracking. The system leverages a Raspberry Pi 4 with a PiCamera and an IR sensor to detect human presence, capture facial images, and utilize AWS Rekognition for face matching. Attendance data is securely logged in AWS DynamoDB, and relevant parties are notified via AWS SNS. The system ensures real-time operation, scalability, and seamless integration with cloud infrastructure, making it suitable for classrooms, labs, or corporate environments.

### 🌐 Webpage and Dashboard
Webpage: [smart-attends.netlify.app](https://smart-attends.netlify.app/)

Dashboard: [main.d5l0x3luaudb1.amplifyapp.com](https://main.d5l0x3luaudb1.amplifyapp.com/)


### **2. Objective**
To eliminate manual attendance processes and improve record accuracy by deploying an automated, real-time face recognition-based attendance system that:

* Captures images only when motion is detected.
* Recognizes faces via AWS Rekognition using a pre-indexed student face collection.
* Logs attendance details in DynamoDB with timestamp and image reference.
* Notifies both student and administrator via email (SNS) upon successful attendance.
* Provides registration via a local web interface hosted on Flask, capturing and uploading student data.

---

### Features

- Real-time face recognition using edge devices
- Automatic headcount of people in a room
- AWS Rekognition for secure and scalable identity matching
- Web dashboard to view attendance logs and analytics
- Live video/image capture from Raspberry Pi
- Alerts for unknown or unauthorized individuals

---

### Technologies Used

#### Hardware
- Raspberry Pi 4
- Pi Camera
- IR sensor for presence detection

### 💻 Software & AI Models

* AWS S3: Storage for face images (registered and attendance)
* AWS Rekognition: Face indexing and matching
* AWS DynamoDB: Metadata and attendance logging
* AWS Lambda : Serverless logic for triggered operations
* AWS IAM: Role and policy management for secured service access
* AWS SNS: Notification to admin and students
* Node.js backend API (dashboard)
* React.js frontend (dashboard)
* Flask: Web-based registration UI hosted locally
* Python (boto3, Flask, Picamera2, etc.)

---

## **System Design**

![image](https://github.com/user-attachments/assets/42f10331-0e75-496b-962d-98b739b3aab6)

## 📊 Work FLow

![recognition Diagram3 drawio](https://github.com/user-attachments/assets/88eb439d-5631-48b0-9add-5bc728df4794)

### Workflow OverviewRaspberry Pi captures an image when someone arrives.

1- Image is uploaded to Amazon S3.

2- Upload triggers a Lambda function.

3- Lambda performs SearchFacesByImage in Rekognition collection.

4- If face is recognized, it looks up name and ID from DynamoDB.

5- Lambda then writes an attendance record (FaceID, Name, Timestamp) to a separate Attendance Table.

6- Prevents duplicate entries per day using conditional checks.

## System Architecture
![FaceRecognitionSystemArchitecture](https://github.com/user-attachments/assets/3616f61b-c88a-4ca0-9694-e39bba51b30c)


**Functional Description**

**Registration Process (Manual or via Web UI):**

* Student inputs name and ID via web interface.
* System captures an image using PiCamera.
* Image is uploaded to S3 (`faceappntust/registered/`).
* Rekognition indexes the face into a collection with `ExternalImageId` as Student ID.
* Face metadata is stored in the `FaceIndex` DynamoDB table.
* Student receives a confirmation notification via AWS SNS.
* System logs attendance for the registration day in the `Attendance` table.

**Attendance Monitoring (Automated):**

* IR sensor detects motion, triggering the camera.
* Captured image is saved locally and uploaded to S3 (`attendancentust/yyyy-mm-dd/`).
* The system calls `SearchFacesByImage` on Rekognition.
* If a match is found, DynamoDB is updated with timestamped attendance.
* If not matched, the image is sent to the `unrecognizedface/` bucket and the user is prompted for registration.
* Upon successful match, SNS notifies the student of recorded attendance.

**Data Flow Summary**

1. IR sensor detects motion → triggers image capture.
2. Image stored locally and uploaded to S3.
3. Rekognition searches for a match in the face collection.
4. Match found → Update `Attendance` table in DynamoDB.
5. No match → Upload to `unrecognizedface`, prompt registration.
6. SNS sends email notification to admin and student.

** Database Schema**

**FaceIndex (DynamoDB)**

* `FaceID` (PK)
* `StudentID`
* `Name`
* `ImageID`

**Attendance (DynamoDB)**

* `StudentID` (PK)
* `Date` (SK)
* `Time`
* `Name`
* `Image` (S3 path)

 #### **Key Features**

* Motion-triggered image capture to save resources.
* Cloud-based face recognition ensures scalability and reliability.
* Real-time attendance marking and alerting.
* Web interface for easy student registration and photo capture.
* Duplicate attendance check prevents multiple logs for same date.
* Modular and scalable code structure (can extend to multiple classrooms).

**Benefits and Use Cases**

* Reduces manual overhead and paper-based tracking.
* Ensures secure, real-time attendance capture.
* Scalable for classrooms, labs, and office premises.
* Can integrate with school management systems for reporting.
* Easily extendable to RFID, QR, or voice recognition systems.

**Testing and Validation**

* Test for face recognition accuracy with varying lighting conditions.
* Validate correct entry in both DynamoDB tables.
* Confirm motion detection works reliably with various speeds.
* Monitor SNS notification delivery success to registered emails.
* Check image storage and naming format consistency in S3.

**Deployment Strategy**

* Local testing on Raspberry Pi with AWS CLI configured
* Deploy Flask UI on boot via crontab
* Secure credentials using IAM roles with least-privilege policy
* Monitor logs via CloudWatch (optional)


**Future Enhancements**

* Add GUI to browse attendance logs
* Face mask detection using Rekognition labels
* Integration with Google Sheets or SES for reporting
* Multi-room or centralized tracking dashboard
* Mobile app interface for attendance insights


## Team Responsibilities
|         Name         | Student  ID |           Job Responsibilities           |
| -------------------- | ----------- | ---------------------------------------- |
| Ravi Shankar Prasad  |  M11202816  |  Software, AWS integration, presentation |
|      Aamir Ali       |  M11202822  |       Hardware procurements/setup        |
|  Hazilky Muna Putra  |  M11302811  |             Github, report               |
|      Jalu Veda       |  M11302824  |        Software, web dashboard           |

**This system represents a robust IoT-cloud solution that seamlessly blends edge computing with serverless cloud processing for smart attendance management.**

