import os
import re
import sqlite3
from datetime import datetime
import uuid
import threading
import time
from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for
from flask_mail import Mail, Message
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'users.db')

EMAIL_REGEX = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
PASSWORD_REGEX = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};:\'"\\|,.<>/?]).{8,}$')

app = Flask(__name__, static_folder=BASE_DIR, static_url_path='')
app.secret_key = os.environ.get('SECRET_KEY', 'replace-this-secret')
app.config['JSON_SORT_KEYS'] = False

# Mail Configuration

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True

import os

app.config['MAIL_USERNAME']=os.environ.get("MAIL_USERNAME")
app.config['MAIL_PASSWORD']=os.environ.get("MAIL_PASSWORD")

mail = Mail(app)

def send_confirmation_email(receiver_email, token):
    try:
        print("Calling mail.send()")
        msg = Message(
            'MSME Confirmation Form',
            sender=app.config['MAIL_USERNAME'],
            recipients=[receiver_email]
            
        )

        confirmation_link = f"https://msme-portal-1210.onrender.com/confirmation/{token}"

        msg.body = f"""
Dear Applicant,

Thank you for showing interest in the MSME Scheme Registration Portal.

We have received your request regarding the selected MSME scheme. To ensure the accuracy of your application and complete the registration verification process, we request you to confirm your scheme registration details through the verification form provided below.

The information submitted through this form will be used to:

• Verify your eligibility for the selected MSME scheme.
• Validate your registration details.
• Maintain accurate records for future communication and scheme-related updates.
• Facilitate a smooth and transparent application process.

Please ensure that all information provided in the form is accurate and up to date. Any incorrect or incomplete information may delay the verification process.

Fill this form to confirm your scheme registration:

{confirmation_link}

If you have already completed the verification form, please ignore this email.

For any queries or assistance, feel free to contact our support team.

Thank you for choosing the MSME Portal. We look forward to assisting you in your business growth journey.

Regards,

MSME Portal Team
Government Support & Registration Services

Email: support@msmeportal.in
Website: www.msmeportal.in
"""

        mail.send(msg)

        print("mail.send() completed")

        print("EMAIL SENT SUCCESSFULLY")

    except Exception as e:
        
        print("EMAIL ERROR:", str(e))

def get_db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection

def add_notification(user_id, message):

    with get_db() as db:

        db.execute(
            '''
            INSERT INTO notifications
            (
                user_id,
                message,
                created_at,
                seen
            )
            VALUES
            (
                ?,
                ?,
                datetime('now'),
                0
            )
            ''',
            (
                user_id,
                message
            )
        )

        db.commit()

def init_db():
    with get_db() as db:
        db.execute(
            '''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            '''
        )
        db.execute(
            '''
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                scheme_name TEXT NOT NULL,
                application_id TEXT NOT NULL UNIQUE,
                application_date TEXT NOT NULL,
                status TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
            '''
        )
        db.execute(
            '''
            CREATE TABLE IF NOT EXISTS saved_schemes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                scheme_name TEXT NOT NULL,
                saved_date TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
            '''
        )
        db.execute(
            '''
            CREATE TABLE IF NOT EXISTS confirmations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                scheme_name TEXT,
                email TEXT,
                token TEXT UNIQUE,
                verified INTEGER DEFAULT 0,
                reminder_sent INTEGER DEFAULT 0,
                created_at TEXT
            )
            '''
        )

        db.execute(
            '''
            CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            message TEXT,
            created_at TEXT,
            seen INTEGER DEFAULT 0
            )
            '''
        )

        try:
            db.execute(
                '''
                ALTER TABLE notifications
                ADD COLUMN seen INTEGER DEFAULT 0
                '''
         )
        except:
            pass

        db.commit()

def validate_registration_payload(payload):
    username = payload.get('username', '').strip()
    email = payload.get('email', '').strip().lower()
    password = payload.get('password', '')
    if not username:
        return 'Username is required.'
    if len(username) < 3:
        return 'Username must be at least 3 characters long.'
    if not email:
        return 'Email is required.'
    if not EMAIL_REGEX.match(email):
        return 'Please enter a valid email address.'
    if not password:
        return 'Password is required.'
    if not PASSWORD_REGEX.match(password):
        return 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.'
    return None


def validate_login_payload(payload):
    username = payload.get('username', '').strip()
    password = payload.get('password', '')
    if not username or not password:
        return 'Username/email and password are required.'
    return None


def find_user(identifier):
    with get_db() as db:
        cursor = db.execute(
            'SELECT * FROM users WHERE lower(username)=lower(?) OR lower(email)=lower(?)',
            (identifier, identifier)
        )
        return cursor.fetchone()


def login_required_json(route):
    def wrapper(*args, **kwargs):
        if not session.get('user_id'):
            return redirect(url_for('login'))
        return route(*args, **kwargs)
    wrapper.__name__ = route.__name__
    return wrapper


def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return None
    with get_db() as db:
        cursor = db.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        return cursor.fetchone()


def get_user_stats(user_id):

    with get_db() as db:

        total = db.execute(
            '''
            SELECT COUNT(*)
            FROM applications
            WHERE user_id=?
            ''',
            (user_id,)
        ).fetchone()[0]

        confirmed = db.execute(
            '''
            SELECT COUNT(*)
            FROM applications
            WHERE user_id=?
            AND status='Confirmed'
            ''',
            (user_id,)
        ).fetchone()[0]

        pending = db.execute(
            '''
            SELECT COUNT(*)
            FROM applications
            WHERE user_id=?
            AND status='Pending'
            ''',
            (user_id,)
        ).fetchone()[0]

        saved = db.execute(
            '''
            SELECT COUNT(*)
            FROM saved_schemes
            WHERE user_id=?
            ''',
            (user_id,)
        ).fetchone()[0]

        return {
            'total': total,
            'confirmed': confirmed,
            'pending': pending,
            'saved': saved
        }

def get_recent_applications(user_id):
    with get_db() as db:
        rows = db.execute(
    '''
    SELECT
        scheme_name,
        application_id,
        application_date,
        status
    FROM applications
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 5
    ''',
    (user_id,)
).fetchall()

        return rows


@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'login.html')


@app.route('/dashboard')
@login_required_json
def dashboard_page():
    return send_from_directory(BASE_DIR, 'dashboard.html')


@app.route('/api/dashboard-data')
@login_required_json
def dashboard_data():
    user = get_current_user()
    stats = get_user_stats(user['id'])
    applications = get_recent_applications(user['id'])
    app_list = [
        {
            'scheme_name': row['scheme_name'],
            'application_id': row['application_id'],
            'application_date': row['application_date'],
            'status': row['status']
        }
        for row in applications
    ]
    return jsonify({
        'username': user['username'],
        'stats': stats,
        'applications': app_list
    })


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


@app.route('/profile.html')
@login_required_json
def profile_page():
    return send_from_directory(BASE_DIR, 'profile.html')


@app.route('/my_applications.html')
@login_required_json
def my_applications_page():

    return send_from_directory(
        BASE_DIR,
        'my_applications.html'
    )

@app.route('/api/my-applications')
@login_required_json
def my_applications():

    user = get_current_user()

    with get_db() as db:

        rows = db.execute(
            '''
            SELECT
                scheme_name,
                application_date,
                status
            FROM applications
            WHERE user_id=?
            ORDER BY application_date DESC
            ''',
            (user['id'],)
        ).fetchall()

    return jsonify([
        dict(row)
        for row in rows
    ])

@app.route('/saved_schemes.html')
@login_required_json
def saved_schemes_page():
    return send_from_directory(BASE_DIR, 'saved_schemes.html')


@app.route('/notifications.html')
@login_required_json
def notifications_page():
    return send_from_directory(BASE_DIR, 'notifications.html')


@app.route('/register.html')
def register_page():
    return send_from_directory(BASE_DIR, 'register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return send_from_directory(BASE_DIR, 'login.html')

    payload = request.get_json() or {}
    error = validate_login_payload(payload)
    if error:
        return jsonify({'message': error}), 400

    user = find_user(payload.get('username', '').strip())
    if user is None:
        return jsonify({'message': 'Invalid username/email or password.'}), 401

    if not check_password_hash(user['password_hash'], payload.get('password', '')):
        return jsonify({'message': 'Invalid username/email or password.'}), 401

    session['user_id'] = user['id']
    session['username'] = user['username']
    return jsonify({'message': 'Login successful.'}), 200


@app.route('/register', methods=['POST'])
def register():
    payload = request.get_json() or {}
    error = validate_registration_payload(payload)
    if error:
        return jsonify({'message': error}), 400

    username = payload.get('username', '').strip()
    email = payload.get('email', '').strip().lower()
    password = payload.get('password', '')

    if find_user(username) is not None:
        return jsonify({'message': 'That username is already taken.'}), 409
    if find_user(email) is not None:
        return jsonify({'message': 'That email is already registered.'}), 409

    password_hash = generate_password_hash(password)
    created_at = datetime.utcnow().isoformat()

    with get_db() as db:
        db.execute(
            'INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
            (username, email, password_hash, created_at)
        )
        db.commit()

    return jsonify({'message': 'Registration successful.'}), 201
def send_reminder_email(receiver_email, token):

    confirmation_link = \
        f"http://127.0.0.1:5000/confirmation/{token}"

    msg = Message(
        'Reminder - MSME Confirmation Pending',
        sender=app.config['MAIL_USERNAME'],
        recipients=[receiver_email]
    )

    msg.body = f"""
Dear Applicant,

You have not completed your MSME Confirmation Form.

Complete it here:

{confirmation_link}

Thank You,
MSME Portal Team
"""

    mail.send(msg)


def schedule_reminder(
    token,
    email,
    user_id,
    scheme_name
):

    time.sleep(60)

    with app.app_context():

        with get_db() as db:

            row = db.execute(
                '''
                SELECT verified
                FROM confirmations
                WHERE token=?
                ''',
                (token,)
            ).fetchone()

            if row and row['verified'] == 0:

                send_reminder_email(
                    email,
                    token
                )
                add_notification(
                    user_id,
                    f"Reminder mail sent for {scheme_name}"
                )
                db.commit()  
@app.route('/submit-confirmation', methods=['POST'])
def submit_confirmation():

    data = request.get_json()
    print(data)
    email = data.get('email')
    token = data.get('token')
    applied_scheme = data.get('appliedScheme')

    with get_db() as db:

        confirmation = db.execute(
            '''
            SELECT *
            FROM confirmations
            WHERE token=?
            ''',
            (token,)
        ).fetchone()

        if confirmation is None:
            return jsonify({
                'message': 'Invalid token'
            }), 400

        if confirmation['email'].lower() != email.lower():
            return jsonify({
                'message': 'Email mismatch'
            }), 400

        db.execute(
            '''
            UPDATE confirmations
            SET verified=1
            WHERE token=?
            ''',
            (token,)
        )

        if applied_scheme == "yes":

            db.execute(
                '''
                UPDATE applications
                SET status='Confirmed',
                    updated_at=?
                WHERE user_id=?
                  AND scheme_name=?
                  AND status='Pending'
                ''',
                (
                    datetime.utcnow().isoformat(),
                    confirmation['user_id'],
                    confirmation['scheme_name']
                )
            )
            db.execute(
        '''
        INSERT INTO notifications
        (
            user_id,
            message,
            created_at,
            seen
        )
        VALUES
        (
            ?,
            ?,
            datetime('now'),
            0
        )
        ''',
        (
            confirmation['user_id'],
            f"Application confirmed for {confirmation['scheme_name']}"
        )
    )

        else:

            db.execute(
                '''
                UPDATE applications
                SET status='not-applied',
                    updated_at=?
                WHERE user_id=?
                  AND scheme_name=?
                  AND status='Pending'
                ''',
                (
                    datetime.utcnow().isoformat(),
                    confirmation['user_id'],
                    confirmation['scheme_name']
                )
            )

            db.execute(
    '''
    INSERT INTO notifications
    (
        user_id,
        message,
        created_at,
        seen
    )
    VALUES
    (
        ?,
        ?,
        datetime('now'),
        0
    )
    ''',
    (
        confirmation['user_id'],
        f"Application marked as Not Applied for {confirmation['scheme_name']}"
    )
)

        db.commit()

    return jsonify({
        'message': 'Confirmation Successful'
    })

@app.route('/apply-scheme', methods=['POST'])
@login_required_json
def apply_scheme():

    print("apply button clicked")

    user = get_current_user()

    scheme_name = request.json.get('scheme_name')

    token = str(uuid.uuid4())

    application_id = str(uuid.uuid4())[:8]

    with get_db() as db:

        # INSERT APPLICATION
        db.execute(
            '''
            INSERT INTO applications
            (
                user_id,
                scheme_name,
                application_id,
                application_date,
                status,
                updated_at
            )
            VALUES(?,?,?,?,?,?)
            ''',
            (
                user['id'],
                scheme_name,
                application_id,
                datetime.utcnow().date().isoformat(),
                'Pending',
                datetime.utcnow().isoformat()
            )
        )
        db.execute(
        # INSERT CONF
            '''
            INSERT INTO confirmations
            (
                user_id,
                scheme_name,
                email,
                token,
                created_at
            )
            VALUES (?, ?, ?, ?, ?)
            ''',
            (
                user['id'],
                scheme_name,
                user['email'],
                token,
                datetime.utcnow().isoformat()
            )
        )

        db.commit()

        print("Database committed")

        print("About to send email")
    

    threading.Thread(
    target=send_confirmation_email,
    args=(user['email'], token),
    daemon=True
).start()
    return jsonify({
    "message": "Application submitted successfully"
}), 200

    print("Email function finished")

    add_notification(
    user['id'],
    f"Confirmation mail sent for {scheme_name}"
    )

    threading.Thread(
    target=schedule_reminder,
    args=(
        token,
        user['email'],
        user['id'],
        scheme_name
    )
).start()
    return jsonify({
        "message": "Confirmation email sent successfully"
    }) 


@app.route('/confirmation/<token>')
def confirmation_page(token):

    session['confirmation_token'] = token

    return send_from_directory(
        BASE_DIR,
        'confirmation_form.html'
    )

@app.route('/<path:filename>')
def static_file(filename):
    return send_from_directory(BASE_DIR, filename)

@app.route('/api/notifications')
@login_required_json
def get_notifications():

    user = get_current_user()

    with get_db() as db:

        rows = db.execute(
    '''
    SELECT *
FROM notifications
WHERE user_id=?
ORDER BY id DESC
    ''',
    (user['id'],)
).fetchall()

    return jsonify([
        dict(row)
        for row in rows
    ])

@app.route('/api/notification-count')
@login_required_json
def notification_count():

    user = get_current_user()

    with get_db() as db:

        count = db.execute(
            '''
            SELECT COUNT(*) as total
            FROM notifications
            WHERE user_id=?
            AND seen=0
            ''',
            (user['id'],)
        ).fetchone()

    return jsonify({
        'count': count['total']
    })

@app.route('/api/read-notifications', methods=['POST'])
@login_required_json
def read_notifications():

    user = get_current_user()

    with get_db() as db:

        db.execute(
            '''
            UPDATE notifications
            SET seen=1
            WHERE user_id=?
            ''',
            (user['id'],)
        )

        db.commit()

    return jsonify({
        'message':'Notifications marked as read'
    })

@app.route('/fix-status')
def fix_status():

    with get_db() as db:

        db.execute("""
            UPDATE applications
            SET status='Not Applied'
            WHERE status='Rejected'
        """)

        db.commit()

    return "Status Updated Successfully"

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
