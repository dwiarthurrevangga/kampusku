# backend/pyramid_kampusku/views/post.py

from pyramid.view     import view_config
from pyramid.response import Response
from ..models         import DBSession, Post, User

def serialize_comment(c):
    """Recursively serialize a Comment and its replies."""
    return {
        'id':         c.id,
        'username':   c.author.username,
        'content':    c.content,
        'created_at': c.created_at.isoformat(),
        'replies':    sorted(
            [serialize_comment(r) for r in c.replies],
            key=lambda x: x['created_at']
        )
    }

@view_config(route_name='posts', renderer='json', request_method='GET')
def get_posts(request):
    """GET /api/posts — return all posts with nested comments."""
    qs = DBSession.query(Post).order_by(Post.created_at.desc()).all()
    out = []
    for p in qs:
        # top-level comments only (parent_id is None)
        top = [c for c in p.comments if c.parent_id is None]
        serialized = {
            'id':         p.id,
            'username':   p.author.username,
            'content':    p.content,
            'created_at': p.created_at.isoformat(),
            'upvotes':    getattr(p, 'upvotes', 0),
            'downvotes':  getattr(p, 'downvotes', 0),
            'comments':   sorted(
                [serialize_comment(c) for c in top],
                key=lambda x: x['created_at']
            )
        }
        out.append(serialized)
    return out

@view_config(route_name='posts', renderer='json', request_method='POST')
def create_post(request):
    """POST /api/posts — create a new post."""
    # clear any pending TX
    try:
        DBSession.rollback()
    except:
        pass

    try:
        data = request.json_body
        user = DBSession.query(User).get(data.get('user_id'))
        if not user:
            request.response.status = 404
            return {'error': 'User not found'}

        p = Post(content=data.get('content', ''), author=user)
        DBSession.add(p)
        DBSession.flush()
        DBSession.commit()

        return {
            'id':         p.id,
            'username':   user.username,
            'content':    p.content,
            'created_at': p.created_at.isoformat(),
            'upvotes':    0,
            'downvotes':  0,
            'comments':   []
        }

    except Exception:
        DBSession.rollback()
        request.response.status = 500
        return {'error': 'Server error creating post'}

@view_config(route_name='post', renderer='json', request_method='PUT')
def update_post(request):
    """PUT /api/posts/{id} — update an existing post."""
    # rollback pending TX
    try:
        DBSession.rollback()
    except:
        pass

    pid = int(request.matchdict['id'])
    p   = DBSession.query(Post).get(pid)
    if not p:
        request.response.status = 404
        return {'error': 'Post not found'}

    data    = request.json_body
    user_id = data.get('user_id')
    # ownership check
    if p.user_id != user_id:
        request.response.status = 403
        return {'error': "Forbidden: cannot edit others' posts"}

    try:
        p.content = data.get('content', p.content)
        DBSession.flush()
        DBSession.commit()
        return {
            'id':         p.id,
            'username':   p.author.username,
            'content':    p.content,
            'created_at': p.created_at.isoformat(),
            'upvotes':    getattr(p, 'upvotes', 0),
            'downvotes':  getattr(p, 'downvotes', 0),
            'comments':   []  # atau serialisasi ulang jika perlu
        }
    except Exception:
        DBSession.rollback()
        request.response.status = 500
        return {'error': 'Server error updating post'}

@view_config(route_name='post', renderer='json', request_method='DELETE')
def delete_post(request):
    """DELETE /api/posts/{id} — delete a post."""
    # rollback pending TX
    try:
        DBSession.rollback()
    except:
        pass

    pid = int(request.matchdict['id'])
    p   = DBSession.query(Post).get(pid)
    if not p:
        request.response.status = 404
        return {'error': 'Post not found'}

    data    = request.json_body
    user_id = data.get('user_id')
    # ownership check
    if p.user_id != user_id:
        request.response.status = 403
        return {'error': "Forbidden: cannot delete others' posts"}

    try:
        DBSession.delete(p)
        DBSession.commit()
        return {'status': 'deleted'}
    except Exception:
        DBSession.rollback()
        request.response.status = 500
        return {'error': 'Server error deleting post'}