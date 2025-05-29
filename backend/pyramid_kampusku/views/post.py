# pyramid_kampusku/views/post.py
from pyramid.view import view_config
from ..models import DBSession, Post, User

@view_config(route_name='posts', renderer='json', request_method='GET')
def get_posts(request):
    qs = DBSession.query(Post).order_by(Post.created_at.desc()).all()
    return [{
        'id': p.id,
        'username': p.author.username,
        'content': p.content,
        'created_at': p.created_at.isoformat(),
        'upvotes': getattr(p, 'upvotes', 0),
        'downvotes': getattr(p, 'downvotes', 0)
    } for p in qs]

@view_config(route_name='posts', renderer='json', request_method='POST')
def create_post(request):
    data = request.json_body
    user = DBSession.query(User).get(data.get('user_id'))
    if user is None:
        request.response.status = 404
        return {'error': 'User not found'}
    p = Post(content=data.get('content', ''), author=user)
    DBSession.add(p)
    DBSession.flush()
    DBSession.commit()
    return {
        'id': p.id,
        'username': user.username,
        'content': p.content,
        'created_at': p.created_at.isoformat(),
        'upvotes': 0,
        'downvotes': 0
    }

@view_config(route_name='post', renderer='json', request_method='PUT')
def update_post(request):
    pid = int(request.matchdict['id'])
    p = DBSession.query(Post).get(pid)
    if p is None:
        request.response.status = 404
        return {'error': 'Post not found'}
    data = request.json_body
    p.content = data.get('content', p.content)
    DBSession.commit()
    return {
        'id': p.id,
        'username': p.author.username,
        'content': p.content,
        'created_at': p.created_at.isoformat()
    }

@view_config(route_name='post', renderer='json', request_method='DELETE')
def delete_post(request):
    pid = int(request.matchdict['id'])
    p = DBSession.query(Post).get(pid)
    if p is None:
        request.response.status = 404
        return {'error': 'Post not found'}
    DBSession.delete(p)
    DBSession.commit()
    return {'status': 'deleted'}
