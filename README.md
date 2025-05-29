# smartFaceRecognistionAWS
Repository for Smart Attendance System using Face Recognition.

# 🧠 Smart Face Recognition-Based Attendance System using IoT & AWS

This project leverages **AI-powered facial recognition**, **IoT devices**, and **AWS cloud services** to automate attendance tracking in classrooms, offices, or smart spaces. It can **identify individuals**, **count people present**, and display **real-time analytics** on a dashboard.

# 🌐 Webpage and Dashboard
Webpage: [smart-attends.netlify.app](https://smart-attends.netlify.app/)

Dashboard: [main.d5l0x3luaudb1.amplifyapp.com](https://main.d5l0x3luaudb1.amplifyapp.com/)



---

## 🚀 Features

- 🎯 Real-time face recognition using edge devices
- 👥 Automatic headcount of people in a room
- ☁️ AWS Rekognition for secure and scalable identity matching
- 📊 Web dashboard to view attendance logs and analytics
- 📷 Live video/image capture from Raspberry Pi
- 🔔 Alerts for unknown or unauthorized individuals

---

## 🧰 Technologies Used

### 📡 Hardware
- Raspberry Pi 4
- Pi Camera
- IR sensor for presence detection

### 💻 Software & AI Models
- Python 
- AWS Rekognition for cloud-based face comparison
- Flask or Node.js backend API
- React.js frontend (dashboard)
- AWS services: S3, DynamoDB, Lambda, API Gateway, IoT Core

---

## 🏗️ System Design

![image](https://github.com/user-attachments/assets/42f10331-0e75-496b-962d-98b739b3aab6)

## 📊 Work FLow

![image](https://github.com/user-attachments/assets/a74210c4-3836-4a03-9c78-e2ae8cfedc5a)

## Workflow OverviewRaspberry Pi captures an image when someone arrives.

1- Image is uploaded to Amazon S3.

2- Upload triggers a Lambda function.

3- Lambda performs SearchFacesByImage in Rekognition collection.

4- If face is recognized, it looks up name and ID from DynamoDB.

5- Lambda then writes an attendance record (FaceID, Name, Timestamp) to a separate Attendance Table.

6- Prevents duplicate entries per day using conditional checks.

## System Architecture
![FaceRecognitionSystemArchitecture](https://github.com/user-attachments/assets/3616f61b-c88a-4ca0-9694-e39bba51b30c)



## Team Responsibilities
|         Name         | Student  ID |           Job Responsibilities           |
| -------------------- | ----------- | ---------------------------------------- |
| Ravi Shankar Prasad  |  M11202816  |  Software, AWS integration, presentation |
|      Aamir Ali       |  M11202822  |       Hardware procurements/setup        |
|  Hazilky Muna Putra  |  M11302811  |             Github, report               |
|      Jalu Veda       |  M11302824  |        Software, web dashboard           |

