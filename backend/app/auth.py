from flask import Blueprint, request, g
import psycopg2.sql
import jsonschema
import bcrypt
from flask_jwt_extended import create_access_token, decode_token
import datetime


bp = Blueprint("auth", __name__)

# AUTH STUFF GOING ON DOWN THERE
# DOENS'T CHECK IF USER IS ACTIVE. MUST CHANGE LATER
@bp.route('/login-student/', methods=['POST'])
def login():
    login_json_schema = {
        'type': 'object',
        'properties' : {
            'username': {'type': 'string', 'maxLength': 50, 'minLength': 3},
            'password': {'type': 'string', 'minLength': 3},
        },
        "required": ["username", "password"],
        "additionalProperties": False,
    }
    data = request.get_json()

    try:
        jsonschema.validate(data, login_json_schema)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    username = data['username'].lower()
    
    with g.db_conn.cursor() as cur:
        # will need to modify what we fetch 
        # so as to changes access token field
 
        cur.execute('SELECT t1.user_id, t1.password_hash, t1.username, t1.school_id, t1.active FROM "user" AS t1 WHERE t1.username = (%s)', [username])
        row = cur.fetchone()
        print(row)

        if not row or not bcrypt.checkpw(data['password'].encode('utf-8'), row[1].encode('utf-8')):
            return {"success":False, "error":"Wrong username or password."}, 400
        
        if not row[4]:
            return {"success":False, "error":"Your account has not been activated yet. Please be patient :)"}, 400
        
        # check if student
        role = None

        cur.execute('SELECT EXISTS(SELECT 1 FROM "user" AS t1 INNER JOIN student AS t2 ON t1.user_id = t2.user_id WHERE t1.username = (%s))', (username, ))
        is_student = cur.fetchone()[0]
        if is_student:
            role = 'student'
        
        cur.execute('SELECT EXISTS(SELECT 1 FROM "user" AS t1 INNER JOIN teacher AS t2 ON t1.user_id = t2.user_id WHERE t1.username = (%s))', (username, ))
        is_teacher = cur.fetchone()[0]
        if is_teacher:
            role = 'teacher'
        
        cur.execute('SELECT EXISTS(SELECT 1 FROM "user" AS t1 INNER JOIN lib_user AS t2 ON t1.user_id = t2.user_id WHERE t1.username = (%s))', (username, ))
        is_lib_editor = cur.fetchone()[0]
        if is_lib_editor:
            role = 'lib_editor'
        
        if not role:
            return {"success": False, "error": 'Invalid user role'}, 400


        identity = {
            'username': username,
            'role': role,
            'school_id':row[3],
            'user_id':row[0],
        }
        token = create_access_token(identity=identity,expires_delta=datetime.timedelta(hours=1))
        
        return {"success": True, "access_token": token}, 200



# Different route for student registering... 
# Helps keep code simpler.

@bp.route('/register-student/', methods=['POST'])
def register():

    # THE USER IS ACTIVE ON REGISTER. WE NEED TO FIX THAT LATER.
    # THE USER NEEDS TO BE ACTIVATE THROUGH LIBRARY_EDITOR
    register_json_schema = {
        'type': 'object',
        'properties' : {
            'first_name': {'type': 'string', 'maxLength': 50, 'minLength': 3},
            'last_name': {'type': 'string', 'maxLength': 50, 'minLength': 3},
            'email': {'type': 'string', 'maxLength': 256, 'minLength':6},
            'password': {'type': 'string', 'minLength':8},
            'confirm_password': {'type': 'string', 'minLength':8},
            'username': {'type': 'string', 'maxLength': 50},
            'school_id': {'type': 'integer'},
            'user_type': {'type': 'string'},
            'dob': {'type':'string',"format": "date",}
        },
        "required": ["username", "password", "first_name", "last_name", "email", "school_id"],
        "additionalProperties": False,
    }
    data = request.get_json()
    
    try:
        jsonschema.validate(data, register_json_schema)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400


    print(data['user_type'])

    # Might be vulnerable to SQL Injections... will check later.
    # Try block is outside covers 2 queries. Hope there aren't any weird bugs with that in case 1 of them fails...
    try:
        with g.db_conn.cursor() as cur:

            # Check if the school exists
            check_school_query = psycopg2.sql.SQL(f"SELECT EXISTS(SELECT 1 FROM school WHERE school_id = {data['school_id']})")
            cur.execute(check_school_query)
            school_id_exists = cur.fetchone()[0]

            if not school_id_exists:
                return {"success": False, "error": "Such a school doesn't exist :("}, 400
            
            # Now we hash the password.
            password = data['password'].encode("utf-8")
            salt = bcrypt.gensalt(12)
            hashed_password = bcrypt.hashpw(password, salt).decode("utf-8")

            # normalize inputs
            username = data['username'].lower()
            email = data['email'].lower()
            first_name = data['first_name'].title()
            last_name = data['last_name'].title()
            
            cur.execute('INSERT INTO "user" (first_name, last_name, username, email, password_hash, school_id, dob)\
                    VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING user_id', 
                        (first_name, last_name, username, email, hashed_password, data['school_id'], data['dob']))

            user_id = cur.fetchone()[0]
            print(user_id)

            if data['user_type'].lower() == 'teacher':
                cur.execute('INSERT INTO teacher (user_id) VALUES (%s)', (user_id,))
            elif data['user_type'].lower() == 'student':
                cur.execute('INSERT INTO student (user_id) VALUES (%s)', (user_id,))
            elif data['user_type'].lower() == 'lib_editor':
                cur.execute('INSERT INTO lib_user (user_id) VALUES (%s)', (user_id,))
            else:
                return {"success": False, "error": 'Wrong user type.'}, 400

            g.db_conn.commit()

            return {"success": True, "user_id": user_id}, 201
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400
    

    
    



@bp.route('/forgot-password/', methods=['POST'])
def forgot_password():
    forgot_password_request_schema = {
        'type': 'object',
        'properties': {
            'email':{'type': 'string','minLength': 6, 'maxLength':256}},
        "required": ["email"],
        "additionalProperties": False,
    }
    data = request.get_json()
    
    try:
        jsonschema.validate(data, forgot_password_request_schema)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    email = data['email'].lower()

    # Check if the email exists in your user database
    # If it does, generate a unique token and send it to the user via email

    token = create_access_token(identity=email, expires_delta=datetime.timedelta(hours=1))
    print(token)
    # Send the email with the token to the user

    return {'message': 'Password reset email sent.'}, 200






@bp.route('/reset-password/', methods=['POST'])
def reset_password():
    reset_password = {
        'type': 'object',
        'properties': {
            'token': {'type':'string'},
            'password': {'type' :'string', 'minLength':8},
            'confirm_password':{'type':'string', 'minLength':8},
        }
    }
    data = request.get_json()

    try:
        jsonschema.validate(data, reset_password)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        email = decode_token(data['token'])['sub'].lower()
    except:
        return {'success': False, "error": "Invalid token."}, 400

    if data['password'] != data['confirm_password']:
        return {'success': False, "error": "Passwords do not match."}, 400
    

    # Now we hash the password.
    password = data['password'].encode("utf-8")
    salt = bcrypt.gensalt(12)
    hashed_password = bcrypt.hashpw(password, salt).decode("utf-8")

    try:
        with g.db_conn.cursor() as cur:
            cur.execute('UPDATE "user" SET password_hash = (%s) WHERE email = (%s)', [hashed_password, email])
            g.db_conn.commit()
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

    return {'success': True }, 200