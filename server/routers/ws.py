"""websocket route. authenticates connection with a signed jwt, subscribes to a
deliberation's event stream. deferred (issue #5 closed); placeholder for now.
"""

from fastapi import APIRouter

router = APIRouter(tags=["ws"])
