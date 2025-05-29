from pyramid.view import view_config
from pyramid.response import Response
from ..models import DBSession, User
import json

@view_config(route_name='register', renderer='json', request_method='POST')
def register(request):
    data = request.json_body
    if DBSession.query(User).filter_by(username=data['username']).first():
        request.response.status = 400
        return {'error':'Username sudah terpakai'}
    u = User(username=data['username'], email=data['email'])
    u.set_password(data['password'])
    DBSession.add(u)
    DBSession.flush()
    DBSession.commit()
    return {'id':u.id, 'username':u.username, 'email':u.email}

@view_config(route_name='login', renderer='json', request_method='POST')
def login(request):
    data = request.json_body
    u = DBSession.query(User).filter_by(username=data['username']).first()
    if not u or not u.check_password(data['password']):
        request.response.status = 401
        return {'error':'Creds invalid'}
    # for simplicity we return user data; you can add JWT here
    return {'id':u.id, 'username':u.username, 'email':u.email}
