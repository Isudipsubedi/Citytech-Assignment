# Trade-offs and Limitations

This document highlights key trade-offs made in the design and the limitations to be aware of.

- Consistency vs Availability:
  - We favor partition-local strong consistency (per-merchant) and eventual cross-partition reconciliation to maximize availability.
  - Globally serializable transactions across many partitions would be expensive and slow.

- Exactly-once vs Simplicity:
  - Exactly-once streaming semantics (Flink + Kafka transactions) simplify reasoning but add complexity and operational burden.
  - We prefer idempotent writes and at-least-once processing in many paths, which is operationally simpler.

- Latency vs Throughput:
  - Streaming with windows provides near-real-time status, but end-of-day aggregates may still be batched for efficiency.
  - Low-latency per-transaction settlement increases cost; batched settlements improve throughput.

- Cost vs Redundancy:
  - Maintaining OLTP and OLAP duplicates data for performance and analytics but increases storage/ops costs.

- Operational Complexity:
  - Running Kafka, Flink, Redis, Postgres, ClickHouse and Kubernetes requires a mature SRE team.
  - Trade-off is improved scalability and correctness at the expense of operational overhead.
