"""event handler pipeline.

steps on every incoming event:
  1. authenticate signature (server.identity)
  2. authorize via capability token (server.identity.tokens)
  3. validate against schema (server.schema)
  4. policy check (server.policy)
  5. append to signed log (server.audit)
  6. transition state (server.deliberations.state)
  7. project to read models / graph (server.models)
"""
