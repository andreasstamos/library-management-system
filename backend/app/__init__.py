from flask import Flask, g
from flask_cors import CORS
import psycopg2.pool
from flask_jwt_extended import create_access_token, JWTManager, decode_token
import datetime


def setup_database(app): 
    db_pool = psycopg2.pool.SimpleConnectionPool(
            minconn     =   app.config["DB_MIN_CONNECTIONS"],
            maxconn     =   app.config["DB_MAX_CONNECTIONS"],
            host        =   app.config["DB_HOST"],
            port        =   app.config["DB_PORT"],
            dbname      =   app.config["DB_NAME"],
            user        =   app.config["DB_USER"],
            password    =   app.config["DB_PASSWORD"],
            )
    
    @app.before_request
    def before_request():
        g.db_conn = db_pool.getconn()

    @app.teardown_request
    def teardown_request(exception=None):
        db_pool.putconn(g.db_conn)

def register_blueprints(app):
    from . import book, auth, school, item, user, admin_ops, students_ops, lib_ops, booking, authors
    app.register_blueprint(book.bp,     url_prefix="/book")
    app.register_blueprint(auth.bp,     url_prefix="/auth")
    app.register_blueprint(school.bp,   url_prefix="/school")
    app.register_blueprint(item.bp,     url_prefix="/item")
    app.register_blueprint(user.bp,     url_prefix="/user")
    app.register_blueprint(booking.bp,     url_prefix="/booking")

    app.register_blueprint(admin_ops.bp,     url_prefix="/admin-api")
    app.register_blueprint(students_ops.bp, url_prefix='/student-api')
    app.register_blueprint(lib_ops.bp,      url_prefix='/lib-api')
    app.register_blueprint(authors.bp, url_prefix='/authors')

def create_app(test_config=None):
    app = Flask(__name__)
    CORS(app, resources={r'/*': {'origins': '*'}}, 
     expose_headers='Authorization', supports_credentials=True)
    JWTManager(app)
    
    app.config.from_object('config')
    app.config.from_mapping(test_config)
    


    setup_database(app)
    register_blueprints(app)

    return app
