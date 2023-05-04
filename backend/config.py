# Mallon tha prepei na allazoume ta credentials kathe fora :(
CORS_ALLOW_ALL_ORIGINS = True
JWT_SECRET_KEY = 'super-secret-key'
DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "library"
DB_USER = "postgres"
DB_PASSWORD = "test"
DB_MIN_CONNECTIONS = 1
DB_MAX_CONNECTIONS = 10
JWT_COOKIE_CSRF_PROTECT = False
JWT_TOKEN_LOCATION = ['headers']
JWT_HEADER_NAME = 'Authorization'
CORS_SUPPORTS_CREDENTIALS = True
PROPAGATE_EXCEPTIONS = True
CORS_ALLOW_HEADERS = "*"
