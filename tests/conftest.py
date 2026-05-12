"""shared test fixtures.

uses sqlite in-memory so tests run without docker. the principal model only
relies on portable types (string, datetime, unique, index) so this is safe
for the mvp; revisit when we add postgres-specific features (jsonb, age).
"""

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from server.deps import get_db, require_admin
from server.main import app
from server.models import Base


@pytest.fixture(scope="session")
def engine():
    eng = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(eng)
    return eng


@pytest.fixture
def db_session(engine) -> Iterator[Session]:
    """transactional rollback fixture — every test sees a clean db.

    opens an outer transaction on a checked-out connection, runs the test
    inside a savepoint, restarts the savepoint whenever the session commits,
    then rolls back the outer transaction at teardown.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, autoflush=False, expire_on_commit=False)
    connection.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def _restart_savepoint(sess: Session, trans) -> None:
        if trans.nested and trans.parent is not None and not trans.parent.nested:
            connection.begin_nested()

    try:
        yield session
    finally:
        session.close()
        if transaction.is_active:
            transaction.rollback()
        connection.close()


@pytest.fixture
def client(db_session) -> Iterator[TestClient]:
    def _override() -> Iterator[Session]:
        yield db_session

    app.dependency_overrides[get_db] = _override
    # tests bypass the admin gate; the gate is exercised by its own test file.
    app.dependency_overrides[require_admin] = lambda: None
    try:
        with TestClient(app) as c:
            yield c
    finally:
        app.dependency_overrides.pop(get_db, None)
        app.dependency_overrides.pop(require_admin, None)
