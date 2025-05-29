from pyramid.view import view_config
from ..models import DBSession, Comment, Post, User

@view_config(route_name='comments', renderer='json', request_method='GET')
def get_comments(request):
    post_id = int(request.matchdict['post_id'])
    qs = DBSession.query(Comment).filter_by(post_id=post_id, parent_id=None).all()
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
    post_id = int(request.matchdict['post_id'])
    data = request.json_body
    user = DBSession.query(User).get(data['user_id'])
    c = Comment(
       content=data['content'],
       author=user,
       post_id=post_id,
       parent_id=data.get('parent_id')
    )
    DBSession.add(c); DBSession.flush()
    return {
      'id':c.id,
      'username':user.username,
      'content':c.content,
      'created_at':c.created_at.isoformat(),
      'replies':[]
    }

@view_config(route_name='comment', renderer='json', request_method='DELETE')
def delete_comment(request):
    cid = int(request.matchdict['id'])
    c = DBSession.query(Comment).get(cid)
    DBSession.delete(c)
    return {'status':'deleted'}
