from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime
from functools import wraps
import os
import sqlite3
import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from flask import send_file
import io
import base64
import pickle
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg') 
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_iris 
from sklearn.preprocessing import LabelEncoder
import pickle
import json
from functools import wraps
import xgboost as xgb
from functools import wraps

app = Flask(__name__)
app.secret_key = 'secret-key'
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app)


NEW_DB_PATH1 = 'clinic_users.db'  

def init_new_db():
    with sqlite3.connect(NEW_DB_PATH1) as conn:
        cursor = conn.cursor()

       
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )
        ''')
        print("✅")

       
        users = [
            ('mohamed.ahmed@clinic.com', '123456', 'doctor'),
            ('sarah.ali@clinic.com', '123456', 'doctor'),
            ('khaled.mansour@clinic.com', '123456', 'doctor'),
            ('asmaa.ali@clinic.com', '123456', 'doctor'),
            ('sora.ali@clinic.com', '123456', 'doctor'),
            ('tamara.mwafaq@clinic.com', '123456', 'doctor'),
            ('amal.ayman@clinic.com', '123456', 'doctor'),
            ('deema.alkhaldi@clinic.com', '123456', 'doctor'),
            ('ali.ahmad@clinic.com', '123456', 'doctor'),
            ('alaa.youssef@clinic.com', '123456', 'doctor'),
            ('youssef.ameen@clinic.com', '123456', 'doctor'),
            ('khalid.ahmad@clinic.com', '123456', 'doctor'),
            ('olah.ahmad@clinic.com', '123456', 'doctor'),
            ('sawsan.ameer@clinic.com', '123456', 'doctor'),
            ('ameer.fouad@clinic.com', '123456', 'doctor'),
            ('areen.ali@clinic.com', '123456', 'doctor'),
            ('mohammad.ibraheem@clinic.com', '123456', 'doctor'),
            ('mahmood.esaam@clinic.com', '123456', 'doctor'),
            ('rami.mohammad@clinic.com', '123456', 'doctor'),
            ('mohammad.khaled@clinic.com', '123456', 'doctor')
        ]

        
        for email, password, role in users:
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            if not cursor.fetchone():
                cursor.execute("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", (email, password, role))

        print("✅ ")


init_new_db()



NEW_DB_PATH1 = 'clinic_users.db'

def add_patient_id_column():
    with sqlite3.connect(NEW_DB_PATH1) as conn:
        cursor = conn.cursor()

       
        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'PatientID' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN PatientID TEXT")
            print("✅   ")
        else:
            print("✅ ")

def init_new_db_with_patient_id():
    with sqlite3.connect(NEW_DB_PATH1) as conn:
        cursor = conn.cursor()

        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )
        ''')
        print("✅ ")

        
        add_patient_id_column()

        
        users = [
            ('mohamed.ahmed@clinic.com', '123456', 'doctor', None),
            ('sarah.ali@clinic.com', '123456', 'doctor', None),
            ('khaled.mansour@clinic.com', '123456', 'doctor', None),
           
            ('patient1@example.com', 'pass123', 'patient', 'P001'),
            ('patient2@example.com', 'pass456', 'patient', 'P002'),
        ]

        
        for email, password, role, PatientID in users:
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            if not cursor.fetchone():
                cursor.execute(
                    "INSERT INTO users (email, password, role, PatientID) VALUES (?, ?, ?, ?)",
                    (email, password, role, PatientID)
                )
                print(f"✅    {email}")

        print("✅  ")


init_new_db_with_patient_id()

       




NEW_DB_PATH = "patient_entry.db"

def init_new_patient_db():
    try:
        with sqlite3.connect(NEW_DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS patients (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    PatientID TEXT NOT NULL,
                    HeartRate REAL,
                    RespiratoryRate REAL,
                    Timestamp TEXT,
                    BodyTemperature REAL,
                    OxygenSaturation REAL,
                    SystolicBloodPressure REAL,
                    DiastolicBloodPressure REAL,
                    Age INTEGER,
                    Gender TEXT,
                    Weight_kg REAL,
                    Height_m REAL,
                    Derived_HRV REAL,
                    Derived_Pulse_Pressure REAL,
                    Derived_BMI REAL,
                    Derived_MAP REAL
                )
            """)
            conn.commit()
            print("✅ ")
    except sqlite3.Error as e:
        print("❌", e)


        

NEW_DB_PATH = "patient_entry.db"

def alter_patient_table():
    try:
        with sqlite3.connect(NEW_DB_PATH) as conn:
            cursor = conn.cursor()

            
            cursor.execute("PRAGMA table_info(patients)")
            columns = [col[1] for col in cursor.fetchall()]
            
            if "medicine" not in columns:
                cursor.execute("ALTER TABLE patients ADD COLUMN medicine TEXT")
                print("✅    'medicine'.")

            if "patient_history" not in columns:
                cursor.execute("ALTER TABLE patients ADD COLUMN patient_history TEXT")
                print("✅    'patient_history'.")

            conn.commit()
            print(" The Edit succeeded🎉  .")
    except sqlite3.Error as e:
        print("Error❌  ", e)


alter_patient_table()




@app.route("/")
def index():
    return redirect(url_for("login"))




@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        
        

        if request.is_json:
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')
            role = data.get('role')
            patient_id = data.get('patient_id')

            with sqlite3.connect(NEW_DB_PATH1) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM users WHERE email=? AND password=?", (email, password))
                user = cursor.fetchone()

                if user:
                   
                    if user[3] != role:
                        return jsonify({'success': False, 'message': 'Invalid role for this account. ⚠️'}), 401

                    session['email'] = email
                    session['role'] = user[3]
                    if user[3] == 'patient' and patient_id:
                        session['PatientID'] = patient_id

                    return jsonify({'success': True})
                else:
                    return jsonify({'success': False, 'message': 'The Email Or Password IS Incorrect❌'}), 401
        else:
            
            email = request.form['email']
            password = request.form['password']
            role = request.form.get('role')
            patient_id = request.form.get('patient_id')

            with sqlite3.connect(NEW_DB_PATH1) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM users WHERE email=? AND password=?", (email, password))
                user = cursor.fetchone()

                if user:
                    session['email'] = email
                    session['role'] = user[3]
                    if user[3] == 'patient' and patient_id:
                        session['PatientID'] = user[4]
                    flash("Login successful.")
                    return redirect(url_for('home'))
                else:
                    flash("Invalid email or password")
                    return render_template("login.html")

    return render_template("login.html")



 
 
 

@app.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        new_password = data.get('new_password')
        with sqlite3.connect(NEW_DB_PATH1) as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE users SET password=? WHERE email=?', (new_password, email))
            if cursor.rowcount == 0:
                return jsonify({'success': False, 'message': 'Email not found.'})
            else:
                conn.commit()
                return jsonify({'success': True, 'message': 'Password changed successfully .'})
    return render_template('forgot_password.html')




@app.route('/home')
def home():
    if "email" not in session:
        flash(" You must log in first  .", "warning")
        return redirect(url_for("login"))
    return render_template("Dashboard.html", role=session.get("role"))







def login_required(roles=None):
    def wrapper(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'role' not in session:
              
                return jsonify({'error': 'Unauthorized. Please log in.'}), 401

            if roles and session['role'] not in roles:
               
                return jsonify({'error': 'Access denied.'}), 403

            return f(*args, **kwargs)
        return decorated_function
    return wrapper









@app.route('/Doctors_page')
@login_required(roles='doctor')
def Doctors_page():
    return render_template('Doctors_page.html')




@app.route('/create_account', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        role = request.form.get('role')

        print(f"Trying to create account with: {email}, {role}")

        if not email or not password or not confirm_password or not role:
            flash("All fields are required.", "danger")
            return redirect(url_for("register"))

        if password != confirm_password:
            flash("Passwords do not match.", "danger")
            return redirect(url_for("register"))

        with sqlite3.connect(NEW_DB_PATH1) as conn:
            cursor = conn.cursor()
            try:
                cursor.execute(
                    'INSERT INTO users (email, password, role) VALUES (?, ?, ?)', 
                    (email, password, role)
                )
                conn.commit()
                flash('Account created successfully.', 'success')
                return redirect(url_for('login'))

            except sqlite3.IntegrityError:
                flash('Email is already registered.', 'danger')
            except Exception as e:
                print("Unexpected error:", e)
                flash(f"Server error: {str(e)}", 'danger')

    return render_template('create_account.html')




@app.route("/about")
def about():
    user_role = session.get('role')
    if user_role not in ['doctor', 'Nurse']:
        flash("Access denied: only doctors and nurses can view this page.", "danger")
        return redirect(url_for('login'))  

    return render_template("about.html")





NEW_DB_PATH = "patient_entry.db"

def allowed_roles():
    user_role = session.get('role')
    return user_role in ['doctor', 'Nurse']

@app.route("/patient_data_entry", methods=["GET"])
def patient_data_entry():
    if not allowed_roles():
        flash("Access denied: only doctors and nurses are allowed.", "danger")
        return redirect(url_for('login'))  
    return render_template("patient_data_entry.html")






@app.route("/save_patient", methods=["POST"])
def save_patient():
    if not allowed_roles():
        flash("Access denied: only doctors and nurses are allowed.", "danger")
        return redirect(url_for('login'))

    try:
        data = request.form
        timestamp = data.get('Timestamp') or datetime.now().isoformat()

        with sqlite3.connect(NEW_DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO patients (
                    PatientID, HeartRate, RespiratoryRate, Timestamp, BodyTemperature,
                    OxygenSaturation, SystolicBloodPressure, DiastolicBloodPressure,
                    Age, Gender, Weight_kg, Height_m, Derived_HRV,
                    Derived_Pulse_Pressure, Derived_BMI, Derived_MAP,
                    medicine, patient_history
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data.get('PatientID'),
                data.get('HeartRate'),
                data.get('RespiratoryRate'),
                timestamp,
                data.get('BodyTemperature'),
                data.get('OxygenSaturation'),
                data.get('SystolicBloodPressure'),
                data.get('DiastolicBloodPressure'),
                data.get('Age'),
                data.get('Gender'),
                data.get('Weight_kg'),
                data.get('Height_m'),
                data.get('Derived_HRV'),
                data.get('Derived_Pulse_Pressure'),
                data.get('Derived_BMI'),
                data.get('Derived_MAP'),
                data.get('medicine'),
                data.get('patient_history')
            ))
            conn.commit()
        return 'The data has been saved successfully✅.', 200
    except Exception as e:
        print("An error occurred while saving the data ❌.", e)
        return 'Server error', 500






@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file-upload' not in request.files:
        flash('⚠️ No file part')
        return redirect(request.url)

    file = request.files['file-upload']

    if file.filename == '':
        flash('⚠️ No selected file')
        return redirect(request.url)

    if file and file.filename.endswith('.csv'):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            df = pd.read_csv(filepath)

            required_columns = [
                'PatientID', 'HeartRate', 'RespiratoryRate', 'Timestamp', 'BodyTemperature',
                'OxygenSaturation', 'SystolicBloodPressure', 'DiastolicBloodPressure',
                'Age', 'Gender', 'Weight_kg', 'Height_m', 'Derived_HRV',
                'Derived_Pulse_Pressure', 'Derived_BMI', 'Derived_MAP'
            ]

            if not all(col in df.columns for col in required_columns):
                flash('❌ Missing required columns in the uploaded file.')
                return redirect(request.url)

            with sqlite3.connect('patient_entry.db') as conn:
                cursor = conn.cursor()
                for _, row in df.iterrows():
                    timestamp = row['Timestamp']
                    cursor.execute('''
                        INSERT INTO patients (
                            PatientID, HeartRate, RespiratoryRate, Timestamp, BodyTemperature,
                            OxygenSaturation, SystolicBloodPressure, DiastolicBloodPressure,
                            Age, Gender, Weight_kg, Height_m, Derived_HRV,
                            Derived_Pulse_Pressure, Derived_BMI, Derived_MAP
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        row['PatientID'],
                        row['HeartRate'],
                        row['RespiratoryRate'],
                        timestamp,
                        row['BodyTemperature'],
                        row['OxygenSaturation'],
                        row['SystolicBloodPressure'],
                        row['DiastolicBloodPressure'],
                        row['Age'],
                        row['Gender'],
                        row['Weight_kg'],
                        row['Height_m'],
                        row['Derived_HRV'],
                        row['Derived_Pulse_Pressure'],
                        row['Derived_BMI'],
                        row['Derived_MAP']
                    ))
                conn.commit()

            flash('✅ File uploaded and data inserted successfully.')
            return redirect(url_for('index'))

        except Exception as e:
            flash(f'❌ Error processing file: {str(e)}')
            return redirect(request.url)

    else:
        flash('⚠️ Invalid file type. Please upload a CSV file.')
        return redirect(request.url)




@app.route("/search_patient", methods=["POST"])
@login_required(roles=['doctor', 'Nurse']) 
def search_patient():
    PatientID = request.form.get("PatientID")
    print("Received PatientID:", PatientID)

    if not PatientID:
        print("No Patient ID provided")
        return jsonify({"found": False})

    conn = sqlite3.connect(NEW_DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute("SELECT * FROM patients WHERE PatientID = ? ORDER BY Timestamp DESC", (PatientID,))
    rows = c.fetchall()
    
    conn.close()

    if not rows:
        print("No records found for patient")
        return jsonify({"found": False})

    latest = dict(rows[0])
    all_readings = [dict(row) for row in rows]

    all_medicines = set()
    all_histories = set()

    for row in all_readings:
        if row.get("medicine"):
            meds = [m.strip() for m in row["medicine"].split(",")]
            all_medicines.update(meds)
        if row.get("patient_history"):
            histories = [h.strip() for h in row["patient_history"].split(",")]
            all_histories.update(histories)

    return jsonify({
        "found": True,
        "latest_info": {
            "PatientID": latest["PatientID"],
            "Age": latest["Age"],
            "Gender": latest["Gender"],
            "Weight_kg": latest["Weight_kg"],
            "Height_m": latest["Height_m"],
            "Derived_BMI": latest["Derived_BMI"],
            "Derived_MAP": latest["Derived_MAP"],
            "Derived_Pulse_Pressure": latest["Derived_Pulse_Pressure"],
            "Derived_HRV": latest["Derived_HRV"]
        },
        "all_readings": all_readings,
        "all_medicines": sorted(all_medicines),
        "all_histories": sorted(all_histories)
    })









@app.route('/get_patient_data', methods=['POST'])
@login_required(roles=['doctor', 'Nurse', 'patient'])  
def get_patient_data():
    user_role = session.get('role')
    print("DEBUG: session role =", session.get('role'))

   
    if user_role == 'patient':
        requested_patient_id = session.get('PatientID')  
        data = request.get_json(silent=True) or {}
        if data and 'patient_id' in data and data['patient_id'] != requested_patient_id:
            return jsonify({'error': 'Access denied: Patients can only view their own data'}), 403
        metrics = [
            "HeartRate", "RespiratoryRate", "BodyTemperature",
            "OxygenSaturation", "SystolicBloodPressure", "DiastolicBloodPressure",
            "Age", "Gender", "Derived_HRV", "Derived_Pulse_Pressure",
            "Derived_BMI", "Derived_MAP"
        ]
        requested_patient_id = requested_patient_id  

   
    elif user_role in ['doctor', 'Nurse']:
        data = request.get_json()
        requested_patient_id = data.get('patient_id')
        metrics = data.get('metrics')

        if not requested_patient_id or not metrics:
            return jsonify({'error': 'Patient ID and metrics are required'}), 400

    else:
        return jsonify({'error': 'Access denied'}), 403

   
    result = {metric: [] for metric in metrics}
    result['timestamps'] = []

    try:
        with sqlite3.connect('patient_entry.db') as conn:
            cursor = conn.cursor()
            safe_metrics = [m for m in metrics if isinstance(m, str) and m.isidentifier()]
            if not safe_metrics:
                return jsonify({'error': 'Invalid metrics'}), 400

            query = f'''
                SELECT Timestamp, {', '.join(safe_metrics)}
                FROM patients
                WHERE PatientID = ?
                ORDER BY Timestamp
            '''
            rows = cursor.execute(query, (requested_patient_id,)).fetchall()
            if not rows:
                return jsonify({"error": "No data found for this patient"}), 404

            for row in rows:
                result['timestamps'].append(row[0])
                for i, metric in enumerate(safe_metrics):
                    val = row[i + 1]
                    result[metric].append(val if val is not None else 0)

    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

    return jsonify(result)



     
model = xgb.XGBClassifier()
model.load_model('final_xgb_model (4).json')
scaler = joblib.load('scaler (4).pkl')

@app.route('/predict_risk', methods=['POST'])
@login_required()
def predict_risk():
    patient_id = None

    if session['role'] == 'patient':
        patient_id = session.get('PatientID')
    else:
        data = request.get_json(silent=True)
        patient_id = data.get('patient_id') if data else None

    if not patient_id:
        return jsonify({'error': 'Patient ID is required'}), 400

    try:
        with sqlite3.connect("patient_entry.db") as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT 
                    HeartRate, RespiratoryRate, BodyTemperature,
                    OxygenSaturation, SystolicBloodPressure, DiastolicBloodPressure,
                    Age, Gender, Derived_BMI
                FROM patients
                WHERE PatientID = ?
                ORDER BY Timestamp DESC
                LIMIT 1
            ''', (patient_id,))
            row = cursor.fetchone()

            if not row:
                return jsonify({'error': 'No data found for this patient'}), 404

               
            gender_value = row[7]
            gender_num = 1 if str(gender_value).lower() == 'male' else 0

             
            model_input = {
                "HeartRate": float(row[0]),
                "RespiratoryRate": float(row[1]),
                "BodyTemperature": float(row[2]),
                "OxygenSaturation": float(row[3]),
                "SystolicBloodPressure": float(row[4]),
                "DiastolicBloodPressure": float(row[5]),
                "Age": float(row[6]),
                "Gender": gender_num,
                "Derived_BMI": float(row[8])
            }

            
            input_df = pd.DataFrame([model_input])

               
            column_mapping = {
                "HeartRate": "Heart Rate",
                "RespiratoryRate": "Respiratory Rate",
                "BodyTemperature": "Body Temperature",
                "OxygenSaturation": "Oxygen Saturation",
                "SystolicBloodPressure": "Systolic Blood Pressure",
                "DiastolicBloodPressure": "Diastolic Blood Pressure",
                "Derived_BMI": "Derived_BMI",
                "Age": "Age",
                "Gender": "Gender"
            }
            input_df.rename(columns=column_mapping, inplace=True)

            
            input_scaled = scaler.transform(input_df)

            
            prediction = model.predict(input_scaled)[0]
            result = "High Risk" if prediction == 1 else "Low Risk"

            return jsonify({
                'risk_prediction': result
            })

    except Exception as e:
        print(f"Error in prediction route: {e}")
        return jsonify({'error': f"Server error: {str(e)}"}), 500





@app.route('/Analytics')
def Analytics():
    role = session.get('role')

    if not role:
        flash("Please login to access analytics.")
        return redirect(url_for('login'))

    patient_id = None
    print("✅ Analytics route accessed.")
    if role == 'patient':
        patient_id = session.get('PatientID')
        if not patient_id:
            flash("Missing patient ID.")
            return redirect(url_for('login'))

    
    return render_template('Analytics.html', patient_id=patient_id, role=role)



@app.route('/logout', methods=['POST'])
def logout():
    session.clear()  
    return redirect('/')

  



if __name__ == "__main__":
   
    init_new_patient_db()
    app.run(debug=True)