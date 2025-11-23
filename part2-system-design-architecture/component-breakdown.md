# Component Breakdown

This page expands on individual components mentioned in the main design and their responsibilities, APIs, and scaling notes.

- Ingestion / API Gateway
  - Responsibilities: authenticate, validate, accept bulk uploads and streaming ingestion, rate-limit and route to Kafka topics.
  - Scale: horizontally behind a load balancer; use pre-signed URLs for large uploads.

- Message Bus (Kafka)
  - Responsibilities: durable event buffer, partition-by-merchant for ordering, retention for reprocessing.
  - Scale: increase partitions and brokers; use compacted topics for metadata.

- Stream Processor (Flink / Kafka Streams)
  - Responsibilities: enrichment, event-time windowing for per-day aggregates, preparing settlement tasks, exactly-once where required.
  - Scale: scale parallelism based on topic partitions.

- Settlement Engine (Stateless Workers)
  - Responsibilities: perform computations, apply idempotency checks, write ledger entries and summaries, emit status updates.
  - Scale: horizontally scale workers; partition work by merchant hash.

- Idempotency Store (Redis)
  - Responsibilities: store deduplication keys, short-lived processing locks, and token claims during settlement execution.
  - Scale: Redis cluster with sharding and replication.

- Ledger / Postgres
  - Responsibilities: authoritative ledger of settlement rows, partitioned by date and merchant ranges to support fast ingest and queries.
  - Scale: partition tables, move cold partitions to cheaper storage.

- Reconciliation Service
  - Responsibilities: periodically compare internal ledger aggregates with external statements and generate discrepancy tasks.
  - Scale: run as scheduled batch jobs or stream-driven comparisons.

- Notification Service
  - Responsibilities: push status updates (WebSocket or push gateway), maintain lightweight status cache for UI.
  - Scale: use clustered websocket gateways or serverless push providers.

- Observability & Ops
  - Metrics: consumer lag, processing latency, failed tasks
  - Tracing: end-to-end trace ids through Kafka and processors
  - Alerts: threshold alerts for lag, error spikes, or reconciliation drift
