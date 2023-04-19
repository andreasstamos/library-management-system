import pytest

from app import create_app
from pytest_postgresql.janitor import DatabaseJanitor
import psycopg2

@pytest.fixture(scope="session")
def test_db(postgresql_proc):
    with DatabaseJanitor(
            host=postgresql_proc.host,
            port=postgresql_proc.port,
            dbname=postgresql_proc.dbname,
            user=postgresql_proc.user,
            password=postgresql_proc.password,
            version=postgresql_proc.version
            ) as janitor:
        janitor.load("../sql/schema.sql")
        yield {
                "DB_HOST": postgresql_proc.host,
                "DB_PORT": postgresql_proc.port,
                "DB_NAME": postgresql_proc.dbname,
                "DB_USER": postgresql_proc.user,
                "DB_PASSWORD": postgresql_proc.password,
                }

@pytest.fixture(scope="session")
def app(test_db):
    app = create_app({
        "TESTING": True,
        **test_db
        })
    return app

@pytest.fixture(scope="session")
def client(app):
    return app.test_client()
