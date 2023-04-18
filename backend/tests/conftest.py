import pytest

from app import create_app
from pytest_postgresql import factories
import psycopg2

postgresql = factories.postgresql("postgresql_proc", load=["../sql/scheme.sql"])

@pytest.fixture
def app(postgresql):
    app = create_app({
        "TESTING": True,
        "DB_HOST": postgresql.info.host,
        "DB_PORT": postgresql.info.port,
        "DB_NAME": postgresql.info.dbname,
        "DB_USER": postgresql.info.user,
        "DB_PASSWORD": postgresql.info.password,
        })
    return app

@pytest.fixture
def client(app):
    return app.test_client()
