# Scalability and Failure Handling

This page details strategies for scaling the settlement processing system and handling failures gracefully.

## Partitioning & Parallelism
- Partition Kafka topics by `merchant_id` to ensure per-merchant ordering and localize processing.
- Choose number of partitions based on expected consumer parallelism and throughput. For 10k merchants and 5M tx/day, start with partitions >= 200 and scale as needed.
- Stream processors parallelize by partition; settlement workers map to partition key ranges.

## Autoscaling & Backpressure
- Autoscale ingestion and worker pods using Kubernetes HPA with metrics:
  - Kafka consumer lag
  - CPU/memory
  - Request rate
- Implement batching in ingestion to reduce per-message overhead.
- Apply backpressure at the stream processor level using built-in mechanisms (Flink backpressure) or consumer flow-control.

## Idempotency and Exactly-Once Considerations
- Use Redis or a highly-available key-value store for idempotency tokens.
- Prefer idempotent upserts for ledger writes to tolerate replays.
- When strict exactly-once is required, leverage Kafka transactions + Flink exactly-once processing; otherwise design idempotent consumers.

## Failure Recovery
- Persist consumer offsets only after downstream durable writes succeed.
- Use Kafka retention and replay to reprocess lost work.
- For external failures (bank APIs), use bounded retries with exponential backoff and dead-letter topics for human intervention.

## Reconciliation and Compensation
- Run reconciliation daily and for suspicious merchants on-demand.
- Generate compensation tasks when mismatches are detected; keep compensation idempotent and auditable.

## Observability
- Track metrics: throughput, latency, error rate, consumer lag, reconciliation drift.
- Use tracing to diagnose cross-service issues.
- Automated alerts for SLA violations and high drift.
