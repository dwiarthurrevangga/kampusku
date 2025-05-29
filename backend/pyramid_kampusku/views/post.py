from pyramid.view import view_config
from ..models import DBSession, Post, User
from pyramid.response import Response

@view_config(route_name='posts', renderer='json', request_method='GET')
def get_posts(request):
    qs = DBSession.query(Post).order_by(Post.created_at.desc()).all()
    return [{
        'id': p.id,
        'username': p.author.username,
        'content': p.content,
        'created_at': p.created_at.isoformat(),
        'upvotes': 0, 'downvotes':0  # tambahkan voting nanti
    } for p in qs]

@view_config(route_name='posts', renderer='json', request_method='POST')
def create_post(request):
    data = request.json_body
    user = DBSession.query(User).get(data['user_id'])
    p = Post(content=data['content'], author=user)
    DBSession.add(p); DBSession.flush()
    return {
      'id': p.id,
      'username': user.username,
      'content': p.content,
      'created_at': p.created_at.isoformat(),
      'upvotes':0,'downvotes':0
    }

@view_config(route_name='post', renderer='json', request_method='PUT')
def update_post(request):
    pid = int(request.matchdict['id'])
    data = request.json_body
    p = DBSession.query(Post).get(pid)
    p.content = data['content']
    return {'status':'ok'}

@view_config(route_name='post', renderer='json', request_method='DELETE')
def delete_post(request):
    pid = int(request.matchdict['id'])
    p = DBSession.query(Post).get(pid)
    DBSession.delete(p)
    return {'status':'deleted'}
