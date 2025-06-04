## smartFaceRecognistionAWS

1. **Motion Detection Trigger**
   The IR sensor monitors for motion and triggers image capture when motion is detected.

2. **Image Capture Using PiCamera2**
   Captures high-resolution still images using PiCamera2 when motion is detected.

3. **Local Image Storage**
   Stores captured images locally in structured date-wise folders on the Raspberry Pi.

4. **Upload to S3 (Attendance Bucket)**
   Uploads the captured image to the `attendancentust` S3 bucket under a date-based prefix.

5. **Attendance Verification via Rekognition**
   Matches the uploaded image using AWS Rekognition with an existing face collection.

6. **Attendance Record Lookup in DynamoDB**
   Checks DynamoDB `Attendance` table for a match to avoid duplicate attendance on the same date.

7. **Attendance Logging in DynamoDB**
   Logs new attendance entries (Student ID, Name, Date, Time, Image path) into the `Attendance` table.

8. **Handling Unrecognized Faces**
   Offers to register a new user if the face is not recognized by Rekognition.

9. **Upload to S3 (Unrecognized Bucket)**
   Stores unrecognized images in the `unrecognizedface` S3 bucket for further registration.

10. **Registration Using Register\_unreco\_face Script**
    Renames and moves image to `faceappntust/registered/`, indexes in Rekognition, and updates the `FaceIndex` and `Attendance` tables.

11. **SNS Notification to Students**
    Sends confirmation email to students upon successful attendance via `AttendanceNotificationTopic`.

12. **SNS Notification to Admin**
    Sends registration and attendance info to admin via `AdminAlertTopic` with student details.

13. **Face Metadata Storage**
    Saves indexed face information (FaceId, Student ID, Name, Image ID) in the `FaceIndex` DynamoDB table.

14. **Duplicate Attendance Check**
    Prevents attendance from being marked more than once for the same student on the same day.
