# backend/setup.py
from setuptools import setup, find_packages

setup(
  name="pyramid_kampusku",               # whatever you like
  version="1.0",
  packages=find_packages(include=['pyramid_kampusku', 'pyramid_kampusku.*']),      # will pick up yourpackage/
  install_requires=[
    "pyramid",
    "pyramid_jinja2",
    "pyramid_debugtoolbar",
    "sqlalchemy",
    "psycopg2-binary",
    "bcrypt",
    "waitress",
  ],
  entry_points={
    "paste.app_factory": [
      "main = pyramid_kampusku:main"
    ]
  }
)
