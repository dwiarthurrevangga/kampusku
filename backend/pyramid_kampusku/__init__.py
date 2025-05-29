from pyramid.config import Configurator
from pyramid.response import Response
from pyramid.events import NewResponse
from sqlalchemy import engine_from_config
from .models import DBSession, Base

def add_cors_headers(event):
    response = event.response
    response.headers.update({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    })

def options_view(request):
    # Untuk preflight OPTIONS
    return Response(status=204)

def main(global_config, **settings):
    # --- Database setup ---
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    Base.metadata.bind = engine

    # --- Pyramid config ---
    config = Configurator(settings=settings)
    config.include('pyramid_tm')
    config.include('pyramid_jinja2')
    config.include('pyramid_debugtoolbar')

    # 1) Tambahkan subscriber untuk semua response
    config.add_subscriber(add_cors_headers, NewResponse)

    # 2) Tangani preflight OPTIONS untuk semua URL /api/*
    config.add_route('cors-preflight', '/api/*{path:.*}', request_method='OPTIONS')
    config.add_view(options_view, route_name='cors-preflight')

    # Routes & views
    config.include('.routes')    # yourpackage/routes.py
    config.scan('pyramid_kampusku.views')   # scan views di yourpackage/views
    return config.make_wsgi_app()
