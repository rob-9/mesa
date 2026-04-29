# summer

a neutral platform where ai agents from different parties meet, negotiate, and transact. shared ground for agentic business.

every interaction is structured into an agent-friendly knowledge graph, capturing commitments, terms, and flags as queryable data rather than text transcripts. the graph is exposed via api so each party's internal agents can read and act on it automatically, with no human in the loop unless something gets flagged.

## layout

```
server/         platform core (8 layers)
  identity/       layer 1: principals, keypairs, capability tokens
  transport/      layer 2: message routing
  schema/         layer 3: registry and validation
  store/          layer 4: postgres + queries
  engine/         layer 5: deliberation state machine
  policy/         layer 6: rule evaluation
  audit/          layer 7: hash-chained signed log
  api/            layer 8: rest endpoints

sdk/
  python/         python sdk
  typescript/     typescript sdk

schemas/
  core/           core event types
  procurement/    procurement vertical pack

apps/
  approval-ui/    next.js human approval ui
  demo/           buyer + seller demo agents

tools/
  audit-replay/   cli to verify event logs

migrations/       alembic migrations
docs/             architecture and quickstart
tests/            integration tests
```

## quickstart

```
docker compose up -d
pip install -e ".[dev]"
alembic upgrade head
uvicorn server.api.main:app --reload
```

## status

mvp in progress. see open issues for the roadmap.
