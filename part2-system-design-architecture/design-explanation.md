# Merchant Settlement Processing - Detailed Design

## Overview

This document describes a design for processing daily merchant settlements at scale. The system handles 10,000 merchants and ~5 million transactions per day, guaranteeing data consistency, idempotency, and real-time status tracking. The architecture uses a streaming ingestion pipeline, partitioned storage, stateless settlement workers, and strong idempotency and reconciliation mechanisms.

## Component Breakdown and Responsibilities

- Ingestion/API Gateway: receives settlement requests and transaction uploads, validates payloads, and publishes to the message bus.
- Message Bus (Kafka): durable, partitioned buffer for high-throughput ingestion and decoupling producers from consumers.
- Stream Processor (Flink/Kafka Streams): performs windowed aggregations, enrichment, and prepares settlement tasks.
- Settlement Engine (stateless workers): executes settlement tasks, applies idempotency checks, writes to the ledger and OLTP store.
- Idempotency Store (Redis/Etcd): fast store for deduplication keys and transaction processing markers.
- Ledger / Settlement Store: partitioned, append-optimized store for settlement rows (Postgres partitions or ClickHouse for analytics + Postgres for authoritative ledger).
- Reconciliation Service: compares ledger aggregates with bank/partner statements, surfaces differences, and triggers compensations.
- Notification / Real-time Status: WebSocket or push gateway to provide live status updates to merchant dashboards.
- Orchestration & Observability: Kubernetes, Prometheus, Grafana, tracing (Jaeger/OpenTelemetry), and alerting.

## Technology Choices & Justifications

- Kafka: proven at high throughput for 5M/day ingestion, supports retention, partitioning, and consumer groups for parallelism.
- Flink / Kafka Streams: stream processing framework for event-time windowing and exactly-once semantics where needed.
- Postgres (partitioned) + ClickHouse/OLAP: Postgres remains authoritative for OLTP and reconciliation; ClickHouse for fast analytical queries and reporting.
- Redis for idempotency and short-lived locks: low latency checks during settlement.
- Kubernetes: container orchestration, autoscaling, and rolling updates.
- gRPC/REST + WebSocket: RPC for internal service comms (gRPC) and WebSocket for real-time client updates.

## Data Flow & Processing Strategy

1. Transactions are ingested via API or batch upload and pushed to Kafka topics partitioned by merchant_id (or hash) for locality.
2. The stream processor enriches transactions (merchant metadata, fee rules), performs windowed aggregations per merchant/day, and emits settlement tasks.
3. Settlement Engine consumes tasks; before applying a settlement, it checks the idempotency key in Redis. If absent, it claims the key and proceeds.
4. Settlements are written to the Ledger (append-only) within idempotent upserts; summary rows are written to Postgres for fast queries.
5. Real-time status updates are pushed to merchants over WebSocket and stored as events for UI history.
6. Reconciliation runs asynchronously: reading ledger aggregates and external statements, generating discrepancy reports and creating compensation tasks when needed.

## Scalability & Failure Handling

- Partitioning: Kafka topics partitioned by merchant_id provides natural scaling and per-merchant ordering. Settlement workers scale horizontally per partition.
- Autoscaling: Kubernetes HPA based on consumer lag and CPU/memory to handle load spikes.
- Backpressure & batching: Stream processors apply backpressure, and ingestion supports batch uploads to amortize overhead.
- Idempotency: Redis-backed deduplication keys plus idempotent upserts into ledger prevent double processing.
- Exactly-once vs At-least-once: use Kafka transactions + Flink exactly-once semantics where strict correctness needed; otherwise design idempotent consumers.
- Failure recovery: consumers persist offsets only after durable writes; replay from Kafka enables reprocessing.
- Reconciliation: periodic reconciliation detects drift and triggers compensations.

## Trade-offs & Limitations

- Strong consistency (strict serializable transactions) across partitioned systems is expensive; we prefer partition-local consistency and eventual cross-partition reconciliation.
- Exactly-once processing introduces complexity; idempotent design simplifies guarantees at acceptable operational cost.
- Cost: maintaining both OLTP and OLAP systems increases operational cost but provides both correctness and analytics.

This design focuses on clear separation of concerns, operational robustness, and practical scalability for the stated throughput while keeping reconciliation and idempotency central to correctness.

***

(See companion pages in this directory: `component-breakdown.md`, `scalability-failure-handling.md`, `tradeoffs.md`, and the PlantUML diagrams `system_architecture.puml`, `data_flow.puml`.)
