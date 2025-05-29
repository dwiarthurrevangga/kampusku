def includeme(config):
    # User
    config.add_route('register', '/api/register')
    config.add_route('login',    '/api/login')

    # Posts
    config.add_route('posts',    '/api/posts')
    config.add_route('post',     '/api/posts/{id}')

    # Comments
    config.add_route('comments', '/api/posts/{post_id}/comments')
    config.add_route('comment',  '/api/comments/{id}')
