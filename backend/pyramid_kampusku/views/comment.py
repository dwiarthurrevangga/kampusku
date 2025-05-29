# pyramid_kampusku/views/comment.py
from pyramid.view import view_config
from ..models import DBSession, Comment, User

@view_config(route_name='comments', renderer='json', request_method='GET')
def get_comments(request):
    post_id = int(request.matchdict['post_id'])
    qs = DBSession.query(Comment)\
                 .filter_by(post_id=post_id, parent_id=None)\
                 .all()
    def serialize(c):
        return {
            'id': c.id,
            'username': c.author.username,
            'content': c.content,
            'created_at': c.created_at.isoformat(),
            'replies': [serialize(r) for r in c.replies]
        }
    return [serialize(c) for c in qs]

@view_config(route_name='comments', renderer='json', request_method='POST')
def add_comment(request):
    try:
        DBSession.rollback()
    except:
        pass
    post_id = int(request.matchdict['post_id'])
    data = request.json_body
    user = DBSession.query(User).get(data.get('user_id'))
    if user is None:
        request.response.status = 404
        return {'error': 'User not found'}
    c = Comment(
        content=data.get('content', ''),
        author=user,
        post_id=post_id,
        parent_id=data.get('parent_id')
    )
    DBSession.add(c)
    DBSession.flush()
    DBSession.commit()
    return {
        'id': c.id,
        'username': user.username,
        'content': c.content,
        'created_at': c.created_at.isoformat(),
        'replies': []
    }

@view_config(route_name='comment', renderer='json', request_method='DELETE')
def delete_comment(request):
    """DELETE /api/comments/{id} — delete a comment."""
    cid = int(request.matchdict['id'])
    c   = DBSession.query(Comment).get(cid)
    if c is None:
        request.response.status = 404
        return {'error': 'Comment not found'}

    data    = request.json_body
    user_id = data.get('user_id')
    # ownership check
    if c.user_id != user_id:
        request.response.status = 403
        return {'error': "Forbidden: cannot delete others' comments"}

    try:
        DBSession.delete(c)
        DBSession.commit()
        return {'status': 'deleted'}
    except Exception:
        DBSession.rollback()
        request.response.status = 500
        return {'error': 'Server error deleting comment'}