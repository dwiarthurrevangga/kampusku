# src/pyramid_kampusku/models.py

from sqlalchemy import (
    Column, Integer, Text, DateTime, String, ForeignKey
)
from sqlalchemy.orm import (
    relationship,
    scoped_session,
    sessionmaker,
    declarative_base
)
import bcrypt
import datetime

DBSession = scoped_session(sessionmaker())
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id       = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email    = Column(String(120), unique=True, nullable=False)
    _pw      = Column("password", String(60), nullable=False)

    posts    = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="author")

    def set_password(self, plaintext):
        self._pw = bcrypt.hashpw(plaintext.encode(), bcrypt.gensalt()).decode()

    def check_password(self, plaintext):
        return bcrypt.checkpw(plaintext.encode(), self._pw.encode())

class Post(Base):
    __tablename__ = 'posts'
    id         = Column(Integer, primary_key=True)
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id    = Column(Integer, ForeignKey('users.id'), nullable=False)

    author     = relationship("User", back_populates="posts")
    comments   = relationship(
        "Comment",
        back_populates="post",
        cascade="all, delete-orphan"
    )

class Comment(Base):
    __tablename__ = 'comments'
    id         = Column(Integer, primary_key=True)
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id    = Column(Integer, ForeignKey('users.id'), nullable=False)
    post_id    = Column(Integer, ForeignKey('posts.id'), nullable=False)
    parent_id  = Column(Integer, ForeignKey('comments.id'), nullable=True)

    # relasi ke user & post
    author     = relationship("User", back_populates="comments")
    post       = relationship("Post", back_populates="comments")

    # self-referential: setiap comment bisa punya parent dan replies
    parent     = relationship(
        "Comment",
        remote_side=[id],
        back_populates="replies",
        uselist=False
    )
    replies    = relationship(
        "Comment",
        back_populates="parent",
        cascade="all, delete-orphan"
    )
