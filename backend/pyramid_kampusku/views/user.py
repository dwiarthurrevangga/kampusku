# backend/pyramid_kampusku/views/user.py

import logging
from pyramid.view      import view_config
from pyramid.response  import Response
from ..models          import DBSession, User

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
    username = data.get('username', '').strip()
    email    = data.get('email', '').strip()
    pw       = data.get('password', '').strip()
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

    except Exception:
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

    username = data.get('username', '').strip()
    pw       = data.get('password', '').strip()
    if not username or not pw:
        request.response.status = 400
        return {'error': 'username and password are required'}

    try:
        u = DBSession.query(User).filter_by(username=username).first()
        if not u or not u.check_password(pw):
            request.response.status = 401
            return {'error': 'Invalid credentials'}

        return {'id': u.id, 'username': u.username, 'email': u.email}

    except Exception:
        log.exception("Error in login")
        DBSession.rollback()
        request.response.status = 500
        return {'error': 'Server error during login'}


@view_config(route_name='user', renderer='json', request_method='GET')
def get_user(request):
    # GET /api/users/{id}
    uid = request.matchdict.get('id')
    try:
        u = DBSession.query(User).get(int(uid))
    except Exception:
        u = None

    if not u:
        request.response.status = 404
        return {'error': 'User not found'}

    return {'id': u.id, 'username': u.username, 'email': u.email}


@view_config(route_name='user', renderer='json', request_method='PUT')
def update_user(request):
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

    uid = request.matchdict.get('id')
    try:
        u = DBSession.query(User).get(int(uid))
    except Exception:
        u = None

    if not u:
        request.response.status = 404
        return {'error': 'User not found'}

    new_username = data.get('username', '').strip()
    new_email    = data.get('email', '').strip()
    if not new_username or not new_email:
        request.response.status = 400
        return {'error': 'username and email are required'}

    # check if another user has that username or email
    dup = DBSession.query(User) \
        .filter(User.id != u.id) \
        .filter((User.username == new_username) | (User.email == new_email)) \
        .first()
    if dup:
        request.response.status = 400
        field = 'email' if dup.email == new_email else 'username'
        return {'error': f'{field} already in use'}

    try:
        u.username = new_username
        u.email    = new_email
        DBSession.flush()
        DBSession.commit()
        return {'id': u.id, 'username': u.username, 'email': u.email}
    except Exception:
        log.exception("Error in update_user")
        DBSession.rollback()
        request.response.status = 500
        return {'error': 'Server error during update'}
