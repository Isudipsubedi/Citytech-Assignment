-- ============================================================================
-- OPTIMIZED QUERY + EXPLANATION
-- File: part1-database-challenge/optimized-query.sql
-- Purpose: Replace the original slow query with an optimized single-pass
-- aggregation approach. Includes step-by-step reasoning and verification
-- instructions (EXPLAIN ANALYZE commands) and index recommendations.
-- ============================================================================

-- NOTES
-- - This version avoids the outer JOIN to `transaction_details` that caused
--   row multiplication and then required a GROUP BY in the outer query.
-- - It performs a single aggregation of `transaction_details` limited to the
--   filtered set of `transaction_master` rows, so `transaction_details` is
--   scanned/aggregated only once for the date range instead of once per
--   master-row (avoiding the N+1 pattern).

-- 1) Pre-filter transaction_master to reduce the working set early.
WITH tm_filtered AS (
    SELECT *
    FROM operators.transaction_master tm
    WHERE tm.txn_date > DATE '2025-11-16'
      AND tm.txn_date < DATE '2025-11-18'
),

-- 2) Aggregate transaction_details once for the filtered masters.
--    We build JSON objects per detail row and aggregate them ordered by
--    local_txn_date_time DESC. This produce a single row per master_txn_id.
td_agg AS (
    SELECT
        td.master_txn_id,
        json_agg(json_build_object(
            'txn_detail_id', td.txn_detail_id,
            'master_txn_id', td.master_txn_id,
            'detail_type', td.detail_type,
            'amount', td.amount,
            'currency', td.currency,
            'description', td.description,
            'local_txn_date_time', td.local_txn_date_time,
            'converted_date', td.local_txn_date_time AT TIME ZONE 'UTC'
        ) ORDER BY td.local_txn_date_time DESC) AS details
    FROM operators.transaction_details td
    JOIN tm_filtered tm ON td.master_txn_id = tm.txn_id
    GROUP BY td.master_txn_id
)

-- 3) Select from the pre-filtered masters and left join the single aggregated
--    details blob. No GROUP BY is required in the outer query.
SELECT
    tm.*,                                  -- all master columns
    tm.txn_id AS "tm.txnId",
    tm.local_txn_date_time AT TIME ZONE 'UTC' AS "tm.localTxnDateTime",
    COALESCE(td_agg.details, '[]'::json) AS details,
    ins.member_name AS member,
    iss.member_name AS issuer
FROM tm_filtered tm
LEFT JOIN td_agg ON td_agg.master_txn_id = tm.txn_id
LEFT JOIN operators.members ins ON tm.gp_acquirer_id = ins.member_id
LEFT JOIN operators.members iss ON tm.gp_issuer_id = iss.member_id
ORDER BY tm.local_txn_date_time DESC;

-- ============================================================================
-- Reasoning / Step-by-step explanation
-- ============================================================================
-- Step A: Pre-filter `transaction_master` (tm_filtered)
-- - Why: dramatically reduces the number of master rows we must consider.
-- - Effect: subsequent joins/aggregations only process transaction_details
--   for the relevant masters in the requested date range.

-- Step B: Aggregate `transaction_details` once into `td_agg`
-- - Why: the original query used a correlated subquery that executed per
--   master row (N times) and a separate JOIN to transaction_details that
--   caused row multiplication and required an outer GROUP BY to collapse
--   duplicates. Both patterns produce extra work and repeated scans.
-- - New approach: scan and aggregate `transaction_details` only once for the
--   filtered set of masters. We produce one JSON array per master_txn_id.

-- Step C: LEFT JOIN aggregated details into masters
-- - Why: this avoids duplication of master rows (no need for GROUP BY in the
--   outer query) and returns a single row per master with a JSON array of
--   its details attached.

-- ============================================================================
-- Answers to the provided analysis questions
-- ============================================================================
-- 1. What happens in the SELECT clause? How many times does it execute?
--    - In the original query the SELECT included a correlated subquery that
--      referenced `tm.txn_id`. That subquery runs once per row returned by
--      the outer query (i.e., N times for N master rows). This is the
--      classic N+1 problem: for N master rows the DB executed the details
--      subquery N times.

-- 2. Why is there a JOIN to transaction_details in the main query?
--    - That JOIN creates one row per detail record, which multiplies the
--      number of rows when a master has multiple details. The author then
--      added a GROUP BY on the outer query to collapse back to one row per
--      master. This pattern is inefficient: join -> explode -> group back.

-- 3. What is the GROUP BY doing? Is it necessary?
--    - The GROUP BY was used to collapse the multiplicity caused by the
--      main JOIN to `transaction_details`. When the correlated subquery also
--      aggregates details per master, the outer GROUP BY becomes unnecessary
--      if we remove the join multiplicity. The optimized query eliminates
--      the outer GROUP BY by removing the join and joining to a pre-aggregated
--      results table instead.

-- 4. How many times is the transaction_details table being scanned?
--    - Original: Potentially once per master row (N times) if the DB can't
--      fully optimize the correlated subquery — or at least one scanned join
--      plus repeated index lookups per master. This yields very poor scaling
--      for large N.
--    - Optimized: `transaction_details` is scanned/aggregated once (for the
--      masters in the date range). The work is O(#relevant_details).

-- 5. What is the time complexity of this query?
--    - Original: roughly O(M * cost_lookup) where M = #master rows and
--      cost_lookup depends on detail-row access. In worst cases this approaches
--      O(M * D) (quadratic-like) behavior if the detail access isn't bounded.
--    - Optimized: O(M + D_filtered) where D_filtered is #detail rows for the
--      filtered masters. This is linear in the input size and scales predictably.

-- ============================================================================
-- Verification steps: comparing original vs optimized
-- ============================================================================
-- Run these commands in `psql` (or via your client) to compare plans and
-- run-time. Replace the original query text where indicated.

-- 1) EXPLAIN ANALYZE the original query (capture time, buffers, and plan):
-- EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
-- <PUT ORIGINAL QUERY HERE>;

-- 2) EXPLAIN ANALYZE the optimized query (this file):
-- EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
-- <PUT THE OPTIMIZED QUERY (above) HERE>;

-- Compare:
-- - Total execution time
-- - Shared/local buffer reads and hit ratios
-- - Number of loops and actual rows for each plan node
-- You should see the optimized query: lower total time, fewer repeated
-- detail-scans, and fewer nested-loop iterations.

-- ============================================================================
-- Suggested indexes (if not already present)
-- ============================================================================
-- These indexes make the filter and join very efficient:
-- CREATE INDEX IF NOT EXISTS idx_tm_txn_date ON operators.transaction_master(txn_date);
-- CREATE INDEX IF NOT EXISTS idx_td_master_txn_id ON operators.transaction_details(master_txn_id);
-- CREATE INDEX IF NOT EXISTS idx_tm_local_txn_date_time ON operators.transaction_master(local_txn_date_time);

-- Optional: if queries often filter by a wider date/time range, consider a
-- composite or BRIN index depending on data distribution.

-- ============================================================================
-- Notes about lateral alternatives
-- ============================================================================
-- A `LATERAL` subquery can also be used (LEFT JOIN LATERAL (SELECT json_agg(...)
-- FROM transaction_details WHERE master_txn_id = tm.txn_id) d ON true). That
-- is clearer but still executes per master-row; the derived-table aggregation
-- approach above is better when you want a single scan of details for many
-- masters (the DB can aggregate in one pass when joined to the filtered
-- master set).

-- ============================================================================
-- End of optimized-query.sql
-- ============================================================================
