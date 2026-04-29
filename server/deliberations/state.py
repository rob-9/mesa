"""pure state machine for a deliberation.

NO imports from fastapi or sqlalchemy. plain python only.
this is the one purity rule we keep from hexagonal architecture: the domain
state machine stays testable in isolation and survives any framework change.

states: open, negotiating, awaiting_approval, paused, closing, closed.
events drive transitions. transition functions take (state, event) -> (state, side_effects).
"""
