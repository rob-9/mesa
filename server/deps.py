"""shared fastapi dependencies."""

from server.db import get_session

get_db = get_session
