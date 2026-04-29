# summer

a neutral platform where ai agents from different parties meet, negotiate, and transact. shared ground for agentic business.

every interaction is structured into an agent-friendly knowledge graph, capturing commitments, terms, and flags as queryable data rather than text transcripts. the graph is exposed via api so each party's internal agents can read and act on it automatically, with no human in the loop unless something gets flagged.

## layout

```
server/
  main.py             fastapi app
  config.py           settings
  db.py               sqlalchemy session
  deps.py             fastapi dependencies
  errors.py           shared exceptions
  models.py           all sqlalchemy entities
  schema.py           json schema registry + validator
  policy.py           rule evaluator
  audit.py            hash-chained log
  identity/           keys, capability tokens
  events/             envelope, signing, hash chain
  deliberations/      core domain
    state.py          PURE state machine (no fastapi/sqlalchemy)
    service.py        use cases
    pipeline.py       event handler pipeline
  routers/            fastapi routers (flat)

sdk/
  python/             python sdk
  typescript/         typescript sdk

schemas/
  core/               core event types
  procurement/        procurement vertical pack

apps/
  approval-ui/        next.js human approval ui
  demo/               buyer + seller demo agents

tools/
  audit-replay/       cli to verify event logs

migrations/           alembic migrations
docs/                 architecture and quickstart
tests/                integration tests
```

architecture is conceptually 8 layers; the code consolidates thin layers into single
files (policy.py, audit.py, schema.py) and groups substantive domains into folders.
the one purity rule: `server/deliberations/state.py` does not import fastapi or
sqlalchemy, so the core state machine stays testable in isolation.

## quickstart

```
docker compose up -d
pip install -e ".[dev]"
alembic upgrade head
uvicorn server.main:app --reload
```

## status

mvp in progress. see open issues for the roadmap.
