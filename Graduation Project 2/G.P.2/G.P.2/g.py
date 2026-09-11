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
model = joblib.load('risk_model.pkl') 

# إعداد Flask
app = Flask(__name__)
app.secret_key = 'secret-key'

# إعداد مجلد رفع الملفات
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# تفعيل CORS (إذا كنت تستعمله)
CORS(app)





NEW_DB_PATH1 = 'clinic_users.db'  # اسم القاعدة الجديدة

def init_new_db():
    with sqlite3.connect(NEW_DB_PATH1) as conn:
        cursor = conn.cursor()

        # إنشاء جدول المستخدمين إذا لم يكن موجودًا
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )
        ''')
        print("✅ تم إنشاء قاعدة البيانات الجديدة وجدول users.")

        # المستخدمين الافتراضيين
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

        # إدخال المستخدمين إن لم يكونوا مضافين مسبقًا
        for email, password, role in users:
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            if not cursor.fetchone():
                cursor.execute("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", (email, password, role))

        print("✅ تم التأكد من إضافة جميع المستخدمين الافتراضيين.")

# نفذ التهيئة
init_new_db()

import sqlite3

NEW_DB_PATH1 = 'clinic_users.db'

def add_patient_id_column():
    with sqlite3.connect(NEW_DB_PATH1) as conn:
        cursor = conn.cursor()

        # جلب أسماء الأعمدة الحالية
        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'PatientID' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN PatientID TEXT")
            print("✅ تم إضافة عمود patient_id إلى جدول users.")
        else:
            print("✅ عمود patient_id موجود مسبقاً في جدول users.")

def init_new_db_with_patient_id():
    with sqlite3.connect(NEW_DB_PATH1) as conn:
        cursor = conn.cursor()

        # إنشاء جدول users إذا لم يكن موجودًا (بدون عمود patient_id لأننا سنضيفه بعد)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )
        ''')
        print("✅ تم إنشاء جدول users (إن لم يكن موجودًا).")

        # أضف عمود patient_id لو مش موجود
        add_patient_id_column()

        # المستخدمين الافتراضيين مع patient_id (ضع None أو '' إن لم يكن للمستخدم patient_id)
        users = [
            ('mohamed.ahmed@clinic.com', '123456', 'doctor', None),
            ('sarah.ali@clinic.com', '123456', 'doctor', None),
            ('khaled.mansour@clinic.com', '123456', 'doctor', None),
            # مثال لمريض:
            ('patient1@example.com', 'pass123', 'patient', 'P001'),
            ('patient2@example.com', 'pass456', 'patient', 'P002'),
        ]

        # أضف المستخدمين إذا لم يكونوا موجودين
        for email, password, role, PatientID in users:
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            if not cursor.fetchone():
                cursor.execute(
                    "INSERT INTO users (email, password, role, PatientID) VALUES (?, ?, ?, ?)",
                    (email, password, role, PatientID)
                )
                print(f"✅ تمت إضافة المستخدم {email}")

        print("✅ تم التأكد من إضافة جميع المستخدمين الافتراضيين مع PatientID.")

# نفذ التهيئة
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
            print("✅ تم إنشاء قاعدة البيانات 'patient_entry.db' وجدول 'patients' بنجاح.")
    except sqlite3.Error as e:
        print("❌ حدث خطأ أثناء إنشاء قاعدة البيانات:", e)


        

NEW_DB_PATH = "patient_entry.db"

def alter_patient_table():
    try:
        with sqlite3.connect(NEW_DB_PATH) as conn:
            cursor = conn.cursor()

            # أضف عمود medicine إذا لم يكن موجودًا
            cursor.execute("PRAGMA table_info(patients)")
            columns = [col[1] for col in cursor.fetchall()]
            
            if "medicine" not in columns:
                cursor.execute("ALTER TABLE patients ADD COLUMN medicine TEXT")
                print("✅ تم إضافة العمود 'medicine'.")

            if "patient_history" not in columns:
                cursor.execute("ALTER TABLE patients ADD COLUMN patient_history TEXT")
                print("✅ تم إضافة العمود 'patient_history'.")

            conn.commit()
            print("🎉 تم تعديل جدول 'patients' بنجاح.")
    except sqlite3.Error as e:
        print("❌ حدث خطأ أثناء تعديل الجدول:", e)

# نفذ العملية
alter_patient_table()




@app.route("/")
def index():
    return redirect(url_for("login"))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        role = request.form.get('role')  # التأكد من جلب الدور
        patient_id = request.form.get('patient_id')  # جلب patient_id إن وُجد

        with sqlite3.connect(NEW_DB_PATH1) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email=? AND password=?", (email, password))
            user = cursor.fetchone()

            if user:
                session['email'] = email
                session['role'] = user[3]

                # إذا كان الدور patient، خزّن patient_id في الجلسة
                if user[3] == 'patient' and patient_id:
                    session['PatientID'] = patient_id

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
                return jsonify({'success': False, 'message': 'البريد الإلكتروني غير موجود.'})
            else:
                conn.commit()
                return jsonify({'success': True, 'message': 'تم تغيير كلمة المرور بنجاح.'})
    return render_template('forgot_password.html')




@app.route('/home')
def home():
    if "email" not in session:
        flash("يجب تسجيل الدخول أولاً.", "warning")
        return redirect(url_for("login"))
    return render_template("Dashboard.html", role=session.get("role"))




def login_required(role=None):
    def wrapper(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'role' not in session:
                flash("Please log in first.")
                return redirect(url_for('login'))
            if role and session['role'] != role:
                flash("Access denied.")
                return redirect(url_for('login'))
            return f(*args, **kwargs)
        return decorated_function
    return wrapper






@app.route('/Doctors_page')
@login_required(role='doctor')
def Doctors_page():
    # هنا يمكنك فيما بعد جلب بيانات الأطباء من قاعدة بيانات أو API
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
            flash("جميع الحقول مطلوبة.", "danger")
            return redirect(url_for("register"))

        if password != confirm_password:
            flash("كلمتا المرور غير متطابقتين.", "danger")
            return redirect(url_for("register"))

        with sqlite3.connect(NEW_DB_PATH1) as conn:
            cursor = conn.cursor()
            try:
                cursor.execute(
                    'INSERT INTO users (email, password, role) VALUES (?, ?, ?)', 
                    (email, password, role)
                )
                conn.commit()
                flash('تم إنشاء الحساب بنجاح.', 'success')
                return redirect(url_for('login'))

            except sqlite3.IntegrityError:
                flash('البريد الإلكتروني مسجل مسبقًا.', 'danger')
            except Exception as e:
                print("Unexpected error:", e)
                flash(f"حدث خطأ: {str(e)}", 'danger')

    return render_template('create_account.html')





@app.route("/about")
def about():
    return render_template("about.html")

NEW_DB_PATH = "patient_entry.db"
 
@app.route("/patient_data_entry", methods=["GET"])


def patient_data_entry():
    return render_template("patient_data_entry.html")
@app.route("/save_patient", methods=["POST"])
def save_patient():
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
                data.get('medicine'),           # هنا تخزين الأدوية
                data.get('patient_history')    # هنا تخزين تاريخ المرض (نص مفصول مثلاً)
            ))
            conn.commit()
        return 'تم الحفظ', 200
    except Exception as e:
        print("❌ خطأ في حفظ البيانات:", e)
        return 'خطأ داخلي في الخادم', 500





@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file-upload' not in request.files:
        flash('No file part')
        return redirect(request.url)

    file = request.files['file-upload']

    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)

    if file and file.filename.endswith('.csv'):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            df = pd.read_csv(filepath)

            # التأكد من وجود الأعمدة المطلوبة
            required_columns = [
                'PatientID', 'HeartRate', 'RespiratoryRate', 'Timestamp', 'BodyTemperature',
                'OxygenSaturation', 'SystolicBloodPressure', 'DiastolicBloodPressure',
                'Age', 'Gender', 'Weight_kg', 'Height_m', 'Derived_HRV',
                'Derived_Pulse_Pressure', 'Derived_BMI', 'Derived_MAP'
            ]

            if not all(col in df.columns for col in required_columns):
                flash('Missing required columns in the uploaded file.')
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

            flash('File uploaded and data inserted successfully.')
            return redirect(url_for('index'))

        except Exception as e:
            flash(f'Error processing file: {str(e)}')
            return redirect(request.url)

    else:
        flash('Invalid file type. Please upload a CSV file.')
        return redirect(request.url)







@app.route("/search_patient", methods=["POST"])
@login_required(role='doctor')

def search_patient():
    patient_id = request.form.get("Patient_id")  # تأكد أن الاسم مطابق لما في الجافاسكريبت

    if not patient_id:
        return jsonify({"found": False})

    conn = sqlite3.connect(NEW_DB_PATH)
    conn.row_factory = sqlite3.Row  # لسهولة التعامل مع الأعمدة بالأسماء
    c = conn.cursor()
    c.execute("SELECT * FROM patients WHERE PatientID = ? ORDER BY Timestamp DESC LIMIT 1", (patient_id,))

    row = c.fetchone()
    conn.close()

    if row:
        patient = {
            "PatientID": row["PatientID"],
            "HeartRate": row["HeartRate"],
            "RespiratoryRate": row["RespiratoryRate"],
            "Timestamp": row["Timestamp"],
            "BodyTemperature": row["BodyTemperature"],
            "OxygenSaturation": row["OxygenSaturation"],
            "SystolicBloodPressure": row["SystolicBloodPressure"],
            "DiastolicBloodPressure": row["DiastolicBloodPressure"],
            "Age": row["Age"],
            "Gender": row["Gender"],
            "Weight_kg": row["Weight_kg"],
            "Height_m": row["Height_m"],
            "Derived_HRV": row["Derived_HRV"],
            "Derived_Pulse_Pressure": row["Derived_Pulse_Pressure"],
            "Derived_BMI": row["Derived_BMI"],
            "Derived_MAP": row["Derived_MAP"]
        }
        return jsonify({"found": True, "patient": patient})
    else:
        return jsonify({"found": False})









@app.route('/get_patient_data', methods=['POST'])
@login_required()
def get_patient_data():
    if 'role' not in session:
        return jsonify({'error': 'Unauthorized. Please log in.'}), 401

    if session['role'] == 'patient':
        requested_patient_id = session.get('username')
        metrics = [
            "HeartRate", "RespiratoryRate", "BodyTemperature",
            "OxygenSaturation", "SystolicBloodPressure", "DiastolicBloodPressure",
            "Age", "Gender", "Derived_HRV", "Derived_Pulse_Pressure",
            "Derived_BMI", "Derived_MAP"
        ]
    else:
        data = request.get_json()
        requested_patient_id = data.get('patient_id')
        metrics = data.get('metrics')

        if not requested_patient_id or not metrics:
            return jsonify({'error': 'Patient ID and metrics are required'}), 400

    result = {metric: [] for metric in metrics}
    result['timestamps'] = []
    prediction_result = None  # سيتم تعبئته لاحقًا

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

            # 🧠 التنبؤ بأحدث قراءة فقط:
            latest_row = rows[-1][1:]  # بدون Timestamp
            input_features = np.array([latest_row], dtype=np.float32)
            input_features = np.array([latest_row], dtype=np.float32)
            prediction = model.predict(input_features)[0]
            
            prediction_result = "High Risk" if prediction == 1 else "Low Risk"

    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

    # نرجع البيانات + نتيجة التنبؤ
    result['risk_prediction'] = prediction_result
    return jsonify(result)







@app.route('/Analytics')
def analytics():
    if 'PatientID' not in session:
        flash("Please login to access analytics.")
        return redirect(url_for('login'))
    
    # استخرج PatientID من الجلسة
    patient_id = session['PatientID']

    # استخرج الدور، لو بدك تستخدمه لاحقاً
    role = session.get('role')

    # أرسل المتغيرات للصفحة لعرض تحليلات المريض فقط
    return render_template('Analytics.html', patient_id=patient_id, role=role)



















@app.route('/logout', methods=['POST'])
def logout():
    session.clear()  # أو أي عملية تسجيل خروج
    return redirect('/')



# بدء التطبيق
if __name__ == "__main__":
   
    init_new_patient_db()
    app.run(debug=True)