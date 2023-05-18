from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
import functools

def check_roles(roles=None):
    def wrapper(fn):
        @functools.wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            identity = get_jwt_identity()
            if roles is None or identity['role'] in roles:
                return fn(*args, **kwargs)
            else:
                return {"success": False, "error": "Access Denied"}, 401
        return decorator
    return wrapper

