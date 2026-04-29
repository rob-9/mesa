"""layer 5: deliberation engine. the core domain.

state.py is pure: no fastapi, no sqlalchemy imports. dataclasses + state transitions only.
service.py wraps state with persistence.
pipeline.py runs the auth -> validate -> policy -> append -> transition flow on incoming events.
"""
