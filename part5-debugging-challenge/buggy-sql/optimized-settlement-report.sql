/*
 * FIXED: Daily settlement report
 * - Corrected GROUP BY to include the date truncation used in SELECT
 * - Added additional useful metrics and improved ordering
 * - Provides verification queries below
 */

-- Correct version: Calculate daily settlement amounts per merchant
SELECT 
    m.member_id,
    m.member_name,
    DATE(tm.txn_date) AS settlement_date,
    SUM(tm.local_amount) AS total_amount,
    COUNT(tm.txn_id) AS transaction_count,
    AVG(tm.local_amount) AS avg_transaction,
    MIN(tm.local_amount) AS min_transaction,
    MAX(tm.local_amount) AS max_transaction
FROM operators.members m
INNER JOIN operators.transaction_master tm ON m.member_id = tm.acq_id
WHERE tm.status = 'COMPLETED'
  AND tm.txn_date >= '2025-11-16'
  AND tm.txn_date < '2025-11-19'
GROUP BY 
    m.member_id, 
    m.member_name, 
    DATE(tm.txn_date)  -- ✅ FIXED: Added settlement_date to GROUP BY
ORDER BY 
    m.member_name,           -- Order by merchant first
    settlement_date ASC,     -- Then by date ascending
    total_amount DESC;       -- Then by amount descending

-- ============================================================================
-- Verification queries
-- ============================================================================

-- 1) Count rows: should be one row per merchant per day (<= merchants * days)
-- SELECT COUNT(*) FROM (
--   <paste the fixed query above without ORDER BY>
-- ) t;

-- 2) Validate totals: per-merchant sum of daily totals equals overall merchant total
-- -- merchant overall total from original (merchant-level) query
-- SELECT m.member_id, SUM(tm.local_amount) AS overall_total
-- FROM operators.members m
-- JOIN operators.transaction_master tm ON m.member_id = tm.acq_id
-- WHERE tm.status = 'COMPLETED'
--   AND tm.txn_date >= '2025-11-16'
--   AND tm.txn_date < '2025-11-19'
-- GROUP BY m.member_id;

-- -- sum of daily totals from fixed query
-- SELECT member_id, SUM(total_amount) as sum_daily_totals FROM (
--   <paste the fixed query above without ORDER BY>
-- ) t GROUP BY member_id;

-- 3) Date distribution check
-- SELECT member_id, COUNT(DISTINCT settlement_date) as num_days,
--        MIN(settlement_date) as first_day, MAX(settlement_date) as last_day
-- FROM (
--   <paste the fixed query above without ORDER BY>
-- ) t
-- GROUP BY member_id;

-- ============================================================================
-- Enhanced version with fees, merchant totals and percent contribution
-- ============================================================================
WITH daily_settlements AS (
    SELECT 
        m.member_id,
        m.member_name,
        m.member_type,
        DATE(tm.txn_date) AS settlement_date,
        SUM(tm.local_amount) AS total_amount,
        COUNT(tm.txn_id) AS transaction_count,
        AVG(tm.local_amount) AS avg_transaction,
        MIN(tm.local_amount) AS min_transaction,
        MAX(tm.local_amount) AS max_transaction,
        -- settlement fee example (2%)
        SUM(tm.local_amount) * 0.02 AS settlement_fee,
        SUM(tm.local_amount) * 0.98 AS net_settlement
    FROM operators.members m
    INNER JOIN operators.transaction_master tm ON m.member_id = tm.acq_id
    WHERE tm.status = 'COMPLETED'
      AND tm.txn_date >= '2025-11-16'
      AND tm.txn_date < '2025-11-19'
    GROUP BY 
        m.member_id, 
        m.member_name,
        m.member_type,
        DATE(tm.txn_date)
),
merchant_totals AS (
    SELECT 
        member_id,
        SUM(total_amount) as merchant_total,
        SUM(transaction_count) as merchant_count
    FROM daily_settlements
    GROUP BY member_id
)
SELECT 
    ds.*,
    mt.merchant_total,
    mt.merchant_count,
    -- percentage of merchant's total for this day
    ROUND((ds.total_amount / NULLIF(mt.merchant_total,0) * 100)::numeric, 2) AS pct_of_total
FROM daily_settlements ds
JOIN merchant_totals mt ON ds.member_id = mt.member_id
ORDER BY ds.member_name, ds.settlement_date;

-- ============================================================================
-- Common pitfalls reminders
-- - If you need rows for merchants with zero transactions on some dates,
--   CROSS JOIN generate_series(...) and LEFT JOIN transaction_master.
-- - Beware of time zone semantics when truncating timestamps to dates.
-- ============================================================================
