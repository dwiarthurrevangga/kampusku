# pyramid_kampusku/views/user.py

from pyramid.view import view_config
from pyramid.response import Response
from ..models import DBSession, User
import logging

log = logging.getLogger(__name__)

@view_config(route_name='register', renderer='json', request_method='POST')
def register(request):
    # clear any pending transaction
    try:
        DBSession.rollback()
    except:
        pass

    # parse JSON
    try:
        data = request.json_body
    except Exception:
        request.response.status = 400
        return {'error': 'Invalid JSON body'}

    # basic validation
    username = data.get('username')
    email    = data.get('email')
    pw       = data.get('password')
    if not username or not email or not pw:
        request.response.status = 400
        return {'error': 'username, email, and password are required'}

    try:
        # check existing username/email
        if DBSession.query(User).filter_by(username=username).first():
            request.response.status = 400
            return {'error': 'Username already taken'}
        if DBSession.query(User).filter_by(email=email).first():
            request.response.status = 400
            return {'error': 'Email already registered'}

        # create & persist
        u = User(username=username, email=email)
        u.set_password(pw)
        DBSession.add(u)
        DBSession.flush()
        DBSession.commit()

        return {'id': u.id, 'username': u.username, 'email': u.email}

    except Exception as exc:
        log.exception("Error in register")
        DBSession.rollback()
        request.response.status = 500
        return {'error': 'Server error during registration'}


@view_config(route_name='login', renderer='json', request_method='POST')
def login(request):
    # clear any pending transaction
    try:
        DBSession.rollback()
    except:
        pass

    # parse JSON
    try:
        data = request.json_body
    except Exception:
        request.response.status = 400
        return {'error': 'Invalid JSON body'}

    username = data.get('username')
    pw       = data.get('password')
    if not username or not pw:
        request.response.status = 400
        return {'error': 'username and password are required'}

    try:
        u = DBSession.query(User).filter_by(username=username).first()
        if not u or not u.check_password(pw):
            request.response.status = 401
            return {'error': 'Invalid credentials'}

        return {'id': u.id, 'username': u.username, 'email': u.email}

    except Exception as exc:
        log.exception("Error in login")
        DBSession.rollback()
        request.response.status = 500
        return {'error': 'Server error during login'}
