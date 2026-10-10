import os
import pytest
from sqlalchemy import create_engine, text


# Override the database URL for tests to use recon_test
TEST_DB_URL = os.getenv("TEST_DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/recon_test")
os.environ["DATABASE_URL"] = TEST_DB_URL

from db.database import Base, engine, SessionLocal
from core.config import settings

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    assert "recon_test" in settings.DATABASE_URL or "recon_test" in TEST_DB_URL
    
    # Base engine to connect to default postgres to create recon_test if needed
    default_url = TEST_DB_URL.replace("recon_test", "postgres")
    default_engine = create_engine(default_url, isolation_level="AUTOCOMMIT")
    
    with default_engine.connect() as conn:
        res = conn.execute(text("SELECT 1 FROM pg_database WHERE datname='recon_test'")).scalar()
        if not res:
            conn.execute(text("CREATE DATABASE recon_test"))
            
    # Now setup the tables
    from alembic.config import Config
    from alembic import command
    
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", TEST_DB_URL)
    try:
        command.downgrade(alembic_cfg, "base")
    except Exception:
        pass
    command.upgrade(alembic_cfg, "head")
    
    yield
    
    # Teardown test DB
    try:
        command.downgrade(alembic_cfg, "base")
    except Exception:
        pass

@pytest.fixture(scope="function", autouse=True)
def db_session(setup_test_database):
    db = SessionLocal()
    yield db
    db.close()
