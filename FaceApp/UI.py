
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from tkinter.scrolledtext import ScrolledText
import threading
import json
import boto3
from datetime import datetime, timedelta
import os
import uuid
from picamera2 import Picamera2
import time
import RPi.GPIO as GPIO
from PIL import Image, ImageTk
import io

class FaceRecognitionGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Face Recognition Attendance System")
        self.root.geometry("1000x700")
        self.root.configure(bg='#f0f0f0')
        
        # AWS setup
        self.s3 = boto3.client('s3')
        self.rekognition = boto3.client('rekognition')
        self.dynamodb = boto3.resource('dynamodb')
        
        # Constants
        self.BUCKET_NAME = 'faceappntust'
        self.ATTENDANCE_BUCKET = 'attendancentust'
        self.COLLECTION_ID = 'StudentFaceCollection'
        self.FACE_TABLE = 'FaceIndex'
        self.ATTENDANCE_TABLE = 'Attendance'
        
        # Local folders
        self.registration_folder = os.path.expanduser('/home/user/FaceApp/Pictures/RegistrationImages')
        self.attendance_folder = os.path.expanduser('/home/user/FaceApp/Pictures/AttendanceImages')
        os.makedirs(self.registration_folder, exist_ok=True)
        os.makedirs(self.attendance_folder, exist_ok=True)
        
        # Camera setup
        self.camera = None
        self.setup_camera()
        
        # GPIO setup for motion detection
        self.setup_gpio()
        self.motion_monitoring = False
        
        # Create GUI
        self.create_widgets()
        self.update_status("System initialized successfully")
        
    def setup_camera(self):
        """Initialize camera"""
        try:
            self.camera = Picamera2()
            self.camera_config = self.camera.create_still_configuration(main={"size": (1024, 768)})
            self.camera.configure(self.camera_config)
            return True
        except Exception as e:
            messagebox.showerror("Camera Error", f"Failed to initialize camera: {str(e)}")
            return False
    
    def setup_gpio(self):
        """Setup GPIO for motion detection"""
        try:
            self.SENSOR_PIN = 17
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(self.SENSOR_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
        except Exception as e:
            print(f"GPIO setup failed: {e}")
    
    def create_widgets(self):
        """Create all GUI widgets"""
        # Title
        title_frame = tk.Frame(self.root, bg='#2c3e50', height=60)
        title_frame.pack(fill=tk.X)
        title_frame.pack_propagate(False)
        
        title_label = tk.Label(title_frame, text="Face Recognition Attendance System", 
                              font=('Arial', 18, 'bold'), fg='white', bg='#2c3e50')
        title_label.pack(expand=True)
        
        # Main content area
        main_frame = tk.Frame(self.root, bg='#f0f0f0')
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Left panel - Controls
        left_panel = tk.Frame(main_frame, bg='white', relief=tk.RAISED, bd=1)
        left_panel.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 5))
        
        # Right panel - Status and logs
        right_panel = tk.Frame(main_frame, bg='white', relief=tk.RAISED, bd=1)
        right_panel.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(5, 0))
        
        self.create_left_panel(left_panel)
        self.create_right_panel(right_panel)
    
    def create_left_panel(self, parent):
        """Create left panel with controls"""
        # Registration section
        reg_frame = tk.LabelFrame(parent, text="Student Registration", font=('Arial', 12, 'bold'),
                                 bg='white', fg='#2c3e50', padx=10, pady=10)
        reg_frame.pack(fill=tk.X, padx=10, pady=(10, 5))
        
        tk.Label(reg_frame, text="Full Name:", bg='white').grid(row=0, column=0, sticky='w', pady=2)
        self.name_entry = tk.Entry(reg_frame, width=30, font=('Arial', 10))
        self.name_entry.grid(row=0, column=1, pady=2, padx=(10, 0))
        
        tk.Label(reg_frame, text="Student ID:", bg='white').grid(row=1, column=0, sticky='w', pady=2)
        self.student_id_entry = tk.Entry(reg_frame, width=30, font=('Arial', 10))
        self.student_id_entry.grid(row=1, column=1, pady=2, padx=(10, 0))
        
        self.register_btn = tk.Button(reg_frame, text="Register Face", command=self.register_face,
                                     bg='#3498db', fg='white', font=('Arial', 10, 'bold'),
                                     padx=20, pady=5)
        self.register_btn.grid(row=2, column=0, columnspan=2, pady=10)
        
        # Attendance section
        attendance_frame = tk.LabelFrame(parent, text="Attendance", font=('Arial', 12, 'bold'),
                                        bg='white', fg='#2c3e50', padx=10, pady=10)
        attendance_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.manual_capture_btn = tk.Button(attendance_frame, text="Manual Capture", 
                                           command=self.manual_capture,
                                           bg='#27ae60', fg='white', font=('Arial', 10, 'bold'),
                                           padx=20, pady=5)
        self.manual_capture_btn.pack(pady=5)
        
        self.motion_toggle_btn = tk.Button(attendance_frame, text="Start Motion Detection", 
                                          command=self.toggle_motion_detection,
                                          bg='#e74c3c', fg='white', font=('Arial', 10, 'bold'),
                                          padx=20, pady=5)
        self.motion_toggle_btn.pack(pady=5)
        
        # View records section
        records_frame = tk.LabelFrame(parent, text="View Records", font=('Arial', 12, 'bold'),
                                     bg='white', fg='#2c3e50', padx=10, pady=10)
        records_frame.pack(fill=tk.X, padx=10, pady=5)
        
        tk.Label(records_frame, text="Select Date:", bg='white').pack(anchor='w')
        self.date_entry = tk.Entry(records_frame, width=20, font=('Arial', 10))
        self.date_entry.pack(pady=2)
        self.date_entry.insert(0, datetime.now().strftime('%Y-%m-%d'))
        
        self.view_records_btn = tk.Button(records_frame, text="View Attendance Records", 
                                         command=self.view_attendance_records,
                                         bg='#9b59b6', fg='white', font=('Arial', 10, 'bold'),
                                         padx=20, pady=5)
        self.view_records_btn.pack(pady=5)
        
        self.export_btn = tk.Button(records_frame, text="Export to CSV", 
                                   command=self.export_to_csv,
                                   bg='#f39c12', fg='white', font=('Arial', 10, 'bold'),
                                   padx=20, pady=5)
        self.export_btn.pack(pady=5)
    
    def create_right_panel(self, parent):
        """Create right panel with status and logs"""
        # Status section
        status_frame = tk.LabelFrame(parent, text="System Status", font=('Arial', 12, 'bold'),
                                    bg='white', fg='#2c3e50', padx=10, pady=10)
        status_frame.pack(fill=tk.X, padx=10, pady=(10, 5))
        
        self.status_label = tk.Label(status_frame, text="Ready", bg='white', fg='#27ae60',
                                    font=('Arial', 10, 'bold'))
        self.status_label.pack()
        
        # Logs section
        logs_frame = tk.LabelFrame(parent, text="Activity Logs", font=('Arial', 12, 'bold'),
                                  bg='white', fg='#2c3e50', padx=10, pady=10)
        logs_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        self.log_text = ScrolledText(logs_frame, height=20, width=50, font=('Courier', 9))
        self.log_text.pack(fill=tk.BOTH, expand=True)
        
        # Clear logs button
        clear_btn = tk.Button(logs_frame, text="Clear Logs", command=self.clear_logs,
                             bg='#95a5a6', fg='white', font=('Arial', 9))
        clear_btn.pack(pady=5)
        
        # Attendance preview section
        preview_frame = tk.LabelFrame(parent, text="Recent Attendance", font=('Arial', 12, 'bold'),
                                     bg='white', fg='#2c3e50', padx=10, pady=10)
        preview_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # Treeview for recent attendance
        columns = ('Time', 'Name', 'Student ID')
        self.attendance_tree = ttk.Treeview(preview_frame, columns=columns, show='headings', height=6)
        
        for col in columns:
            self.attendance_tree.heading(col, text=col)
            self.attendance_tree.column(col, width=80)
        
        self.attendance_tree.pack(fill=tk.X, pady=5)
        
        # Load recent attendance
        self.load_recent_attendance()
    
    def update_status(self, message):
        """Update status label and log"""
        self.status_label.config(text=message)
        self.log_message(message)
    
    def log_message(self, message):
        """Add message to log"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        log_entry = f"[{timestamp}] {message}\n"
        self.log_text.insert(tk.END, log_entry)
        self.log_text.see(tk.END)
        self.root.update_idletasks()
    
    def clear_logs(self):
        """Clear log text"""
        self.log_text.delete(1.0, tk.END)
    
    def register_face(self):
        """Register a new face"""
        name = self.name_entry.get().strip()
        student_id = self.student_id_entry.get().strip()
        
        if not name or not student_id:
            messagebox.showerror("Error", "Please enter both name and student ID")
            return
        
        def registration_process():
            try:
                self.update_status("Starting face registration...")
                
                # Capture image
                if not self.camera:
                    self.setup_camera()
                
                self.camera.start()
                time.sleep(2)
                
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                image_filename = f"{student_id}_{timestamp}.jpg"
                image_path = os.path.join(self.registration_folder, image_filename)
                s3_key = f"registered/{image_filename}"
                
                self.update_status("Capturing image...")
                self.camera.capture_file(image_path)
                self.camera.stop()
                
                self.update_status("Uploading to S3...")
                self.s3.upload_file(image_path, self.BUCKET_NAME, s3_key)
                
                self.update_status("Indexing face in Rekognition...")
                response = self.rekognition.index_faces(
                    CollectionId=self.COLLECTION_ID,
                    Image={'S3Object': {'Bucket': self.BUCKET_NAME, 'Name': s3_key}},
                    ExternalImageId=student_id,
                    DetectionAttributes=['DEFAULT']
                )
                
                if not response['FaceRecords']:
                    self.update_status("❌ No face detected. Registration failed.")
                    return
                
                face_id = response['FaceRecords'][0]['Face']['FaceId']
                
                self.update_status("Storing metadata in DynamoDB...")
                table = self.dynamodb.Table(self.FACE_TABLE)
                table.put_item(
                    Item={
                        'StudentID': student_id,
                        'FaceID': face_id,
                        'Name': name,
                        'ImageID': image_filename
                    }
                )
                
                self.update_status(f"✅ Registration complete for {name} ({student_id})")
                
                # Clear form
                self.name_entry.delete(0, tk.END)
                self.student_id_entry.delete(0, tk.END)
                
            except Exception as e:
                self.update_status(f"❌ Registration failed: {str(e)}")
        
        # Run in separate thread
        threading.Thread(target=registration_process, daemon=True).start()
    
    def manual_capture(self):
        """Manual capture for attendance"""
        def capture_process():
            try:
                self.update_status("Capturing image for attendance...")
                
                if not self.camera:
                    self.setup_camera()
                
                self.camera.start()
                time.sleep(2)
                
                timestamp = datetime.now()
                date_folder = timestamp.strftime('%Y-%m-%d')
                time_stamp = timestamp.strftime('%H%M%S')
                image_name = f"capture_{time_stamp}.jpg"
                
                dated_local_folder = os.path.join(self.attendance_folder, date_folder)
                os.makedirs(dated_local_folder, exist_ok=True)
                local_path = os.path.join(dated_local_folder, image_name)
                s3_key = f"{date_folder}/{image_name}"
                
                self.camera.capture_file(local_path)
                self.camera.stop()
                
                self.update_status("Uploading image...")
                self.s3.upload_file(local_path, self.ATTENDANCE_BUCKET, s3_key)
                
                self.update_status("✅ Image uploaded. Waiting for face recognition...")
                
                # Wait for Lambda processing
                self.wait_for_attendance_record(s3_key)
                
            except Exception as e:
                self.update_status(f"❌ Capture failed: {str(e)}")
        
        threading.Thread(target=capture_process, daemon=True).start()
    
    def wait_for_attendance_record(self, s3_key, timeout=10):
        """Wait for attendance record to be created"""
        start_time = time.time()
        table = self.dynamodb.Table(self.ATTENDANCE_TABLE)
        
        while time.time() - start_time < timeout:
            try:
                response = table.scan(
                    FilterExpression=boto3.dynamodb.conditions.Attr('Image').eq(s3_key)
                )
                items = response.get('Items', [])
                if items:
                    name = items[0].get('Name', 'Unknown')
                    self.update_status(f"✅ Attendance marked for {name}")
                    self.load_recent_attendance()  # Refresh attendance display
                    return True
            except Exception as e:
                self.update_status(f"Error checking attendance: {str(e)}")
                break
            time.sleep(1)
        
        self.update_status("⚠️ No attendance record found for image.")
        return False
    
    def toggle_motion_detection(self):
        """Toggle motion detection"""
        if not self.motion_monitoring:
            self.start_motion_detection()
        else:
            self.stop_motion_detection()
    
    def start_motion_detection(self):
        """Start motion detection"""
        self.motion_monitoring = True
        self.motion_toggle_btn.config(text="Stop Motion Detection", bg='#27ae60')
        self.update_status("Motion detection started")
        
        def motion_loop():
            motion_detected = False
            while self.motion_monitoring:
                try:
                    if GPIO.input(self.SENSOR_PIN) == 0:
                        if not motion_detected:
                            self.update_status("⚠️ Motion detected! Capturing image...")
                            self.manual_capture()
                            motion_detected = True
                    else:
                        if motion_detected:
                            self.update_status("✅ Motion ended. Ready for next detection.")
                        motion_detected = False
                    time.sleep(1)
                except Exception as e:
                    self.update_status(f"Motion detection error: {str(e)}")
                    break
        
        threading.Thread(target=motion_loop, daemon=True).start()
    
    def stop_motion_detection(self):
        """Stop motion detection"""
        self.motion_monitoring = False
        self.motion_toggle_btn.config(text="Start Motion Detection", bg='#e74c3c')
        self.update_status("Motion detection stopped")
    
    def view_attendance_records(self):
        """View attendance records for selected date"""
        selected_date = self.date_entry.get().strip()
        
        def view_process():
            try:
                self.update_status(f"Loading attendance records for {selected_date}...")
                
                table = self.dynamodb.Table(self.ATTENDANCE_TABLE)
                response = table.scan(
                    FilterExpression=boto3.dynamodb.conditions.Attr('Date').eq(selected_date)
                )
                
                items = response.get('Items', [])
                
                if not items:
                    self.update_status(f"No attendance records found for {selected_date}")
                    return
                
                # Create new window to display records
                records_window = tk.Toplevel(self.root)
                records_window.title(f"Attendance Records - {selected_date}")
                records_window.geometry("600x400")
                
                # Create treeview
                columns = ('Time', 'Name', 'Student ID')
                tree = ttk.Treeview(records_window, columns=columns, show='headings')
                
                for col in columns:
                    tree.heading(col, text=col)
                    tree.column(col, width=150)
                
                # Add scrollbar
                scrollbar = ttk.Scrollbar(records_window, orient=tk.VERTICAL, command=tree.yview)
                tree.configure(yscrollcommand=scrollbar.set)
                
                # Pack widgets
                tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
                scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
                
                # Insert data
                for item in sorted(items, key=lambda x: x.get('Time', '')):
                    tree.insert('', tk.END, values=(
                        item.get('Time', ''),
                        item.get('Name', ''),
                        item.get('StudentID', '')
                    ))
                
                self.update_status(f"✅ Loaded {len(items)} attendance records")
                
            except Exception as e:
                self.update_status(f"❌ Error loading records: {str(e)}")
        
        threading.Thread(target=view_process, daemon=True).start()
    
    def load_recent_attendance(self):
        """Load recent attendance in the preview"""
        def load_process():
            try:
                table = self.dynamodb.Table(self.ATTENDANCE_TABLE)
                today = datetime.now().strftime('%Y-%m-%d')
                
                response = table.scan(
                    FilterExpression=boto3.dynamodb.conditions.Attr('Date').eq(today)
                )
                
                items = response.get('Items', [])
                
                # Clear existing items
                for item in self.attendance_tree.get_children():
                    self.attendance_tree.delete(item)
                
                # Add recent items (last 10)
                for item in sorted(items, key=lambda x: x.get('Time', ''), reverse=True)[:10]:
                    self.attendance_tree.insert('', tk.END, values=(
                        item.get('Time', ''),
                        item.get('Name', ''),
                        item.get('StudentID', '')
                    ))
                
            except Exception as e:
                self.log_message(f"Error loading recent attendance: {str(e)}")
        
        threading.Thread(target=load_process, daemon=True).start()
    
    def export_to_csv(self):
        """Export attendance records to CSV"""
        selected_date = self.date_entry.get().strip()
        
        def export_process():
            try:
                self.update_status(f"Exporting attendance records for {selected_date}...")
                
                table = self.dynamodb.Table(self.ATTENDANCE_TABLE)
                response = table.scan(
                    FilterExpression=boto3.dynamodb.conditions.Attr('Date').eq(selected_date)
                )
                
                items = response.get('Items', [])
                
                if not items:
                    self.update_status(f"No records to export for {selected_date}")
                    return
                
                # Ask for save location
                filename = filedialog.asksaveasfilename(
                    defaultextension=".csv",
                    filetypes=[("CSV files", "*.csv")],
                    initialname=f"attendance_{selected_date}.csv"
                )
                
                if filename:
                    import csv
                    with open(filename, 'w', newline='') as csvfile:
                        fieldnames = ['Date', 'Time', 'Name', 'StudentID']
                        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                        
                        writer.writeheader()
                        for item in sorted(items, key=lambda x: x.get('Time', '')):
                            writer.writerow({
                                'Date': item.get('Date', ''),
                                'Time': item.get('Time', ''),
                                'Name': item.get('Name', ''),
                                'StudentID': item.get('StudentID', '')
                            })
                    
                    self.update_status(f"✅ Exported {len(items)} records to {filename}")
                
            except Exception as e:
                self.update_status(f"❌ Export failed: {str(e)}")
        
        threading.Thread(target=export_process, daemon=True).start()
    
    def on_closing(self):
        """Handle window closing"""
        self.motion_monitoring = False
        if self.camera:
            try:
                self.camera.stop()
            except:
                pass
        try:
            GPIO.cleanup()
        except:
            pass
        self.root.destroy()

def main():
    root = tk.Tk()
    app = FaceRecognitionGUI(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()

if __name__ == "__main__":
    main()
