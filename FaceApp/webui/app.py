# app.py
from flask import Flask, render_template, request
import subprocess

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('register.html')

@app.route('/register', methods=['POST'])
def register():
    name = request.form['name']
    student_id = request.form['student_id']

    subprocess.run([
        'python3',
        '/home/user/FaceApp/FaceRegistrationSNSWebui.py',
        '--name', name,
        '--student_id', student_id
    ])

    return render_template('success.html', name=name, student_id=student_id)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
