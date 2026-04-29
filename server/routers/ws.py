"""websocket route. authenticates connection with a signed jwt, subscribes to a
deliberation's event stream.
"""

from fastapi import APIRouter

router = APIRouter(tags=["ws"])
