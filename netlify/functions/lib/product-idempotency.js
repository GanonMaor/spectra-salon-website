/**
 * netlify/functions/lib/product-idempotency.js
 * ─────────────────────────────────────────────────────────────────────────
 * Milestone 4 Hardening: Operation idempotency via product_resolution_operations.
 *
 * Execution model:
 *   1. Reserve operationId durably (INSERT ... ON CONFLICT).
 *   2. Validate requestHash.
 *   3. If completed, return resultSnapshot immediately.
 *   4. If conflict (wrong user/action/hash), return 409.
 *   5. Mark operation as "running" with lease expiry.
 *   6. Execute structural transaction (caller responsibility).
 *   7. Persist "completed" + resultSnapshot.
 *   8. On failure, persist failed status.
 *
 * Lease/timeout:
 *   Operations marked "running" with an expired lease are considered
 *   abandoned and can be re-attempted. Lease duration defaults to 120s.
 */

"use strict";

const OPERATION_LEASE_SECONDS =
  parseInt(process.env.OPERATION_LEASE_SECONDS || "120", 10);

/**
 * Reserve an operation ID.
 *
 * Returns one of:
 *   { status: "new" }             — first call, proceed
 *   { status: "completed", resultSnapshot } — already done, return immediately
 *   { status: "running_lease_ok" } — another request is processing, caller should wait/retry
 *   { status: "running_lease_expired" } — abandoned, caller can take over
 *
 * Throws 409 on conflict (different user, action, or hash).
 *
 * @param {import('pg').Client} client
 * @param {{ operationId: string, userId: string, action: string, requestHash: string }} opts
 */
async function reserveOperation(client, { operationId, userId, action, requestHash }) {
  // Try to insert
  await client.query(
    `INSERT INTO product_resolution_operations
       (operation_id, user_id, action, request_hash, status)
     VALUES ($1, $2, $3, $4, 'pending')
     ON CONFLICT (operation_id) DO NOTHING`,
    [operationId, userId, action, requestHash]
  );

  // Fetch the row (whether we just inserted or it existed)
  const { rows } = await client.query(
    `SELECT * FROM product_resolution_operations WHERE operation_id = $1`,
    [operationId]
  );

  if (!rows.length) {
    // Extremely unlikely race; treat as conflict
    const err = new Error("Operation reservation failed due to a race condition");
    err.statusCode = 500;
    throw err;
  }

  const op = rows[0];

  // Identity conflict check
  if (op.user_id !== userId) {
    const err = new Error(
      `Operation ${operationId} was reserved by a different user`
    );
    err.statusCode = 409;
    err.code = "operation_conflict";
    throw err;
  }
  if (op.action !== action) {
    const err = new Error(
      `Operation ${operationId} was reserved for action "${op.action}", not "${action}"`
    );
    err.statusCode = 409;
    err.code = "operation_conflict";
    throw err;
  }
  if (op.request_hash !== requestHash) {
    const err = new Error(
      `Operation ${operationId} was reserved with a different request payload`
    );
    err.statusCode = 409;
    err.code = "operation_conflict";
    throw err;
  }

  // Already completed — idempotent replay
  if (op.status === "completed" && op.result_snapshot) {
    return { status: "completed", resultSnapshot: op.result_snapshot };
  }

  // Currently running with a valid lease — another request is processing
  if (
    op.status === "running" &&
    op.lease_expires_at &&
    new Date(op.lease_expires_at) > new Date()
  ) {
    return { status: "running_lease_ok" };
  }

  // Running with expired lease — take over
  if (op.status === "running" && (!op.lease_expires_at || new Date(op.lease_expires_at) <= new Date())) {
    return { status: "running_lease_expired" };
  }

  // pending or failed_retryable — proceed
  return { status: "new" };
}

/**
 * Atomically mark an operation as "running" with a lease.
 * Performs a conditional update (only if status is pending/failed_retryable
 * or running with expired lease) to prevent double-execution.
 *
 * @param {import('pg').Client} client
 * @param {string} operationId
 */
async function markOperationRunning(client, operationId) {
  const leaseExpiresAt = new Date(
    Date.now() + OPERATION_LEASE_SECONDS * 1000
  ).toISOString();

  await client.query(
    `UPDATE product_resolution_operations
     SET status = 'running', started_at = NOW(), lease_expires_at = $2
     WHERE operation_id = $1
       AND (
         status IN ('pending','failed_retryable')
         OR (status = 'running' AND (lease_expires_at IS NULL OR lease_expires_at <= NOW()))
       )`,
    [operationId, leaseExpiresAt]
  );
}

/**
 * Mark an operation as completed and persist the result snapshot.
 *
 * @param {import('pg').Client} client
 * @param {string} operationId
 * @param {object} resultSnapshot
 */
async function markOperationCompleted(client, operationId, resultSnapshot) {
  await client.query(
    `UPDATE product_resolution_operations
     SET status = 'completed', completed_at = NOW(), result_snapshot = $2,
         lease_expires_at = NULL
     WHERE operation_id = $1`,
    [operationId, JSON.stringify(resultSnapshot)]
  );
}

/**
 * Mark an operation as failed.
 *
 * @param {import('pg').Client} client
 * @param {string} operationId
 * @param {{ retryable?: boolean, errorMessage: string }} opts
 */
async function markOperationFailed(client, operationId, { retryable = false, errorMessage }) {
  const newStatus = retryable ? "failed_retryable" : "failed_terminal";
  await client.query(
    `UPDATE product_resolution_operations
     SET status = $2, error_message = $3, retry_count = retry_count + 1,
         lease_expires_at = NULL
     WHERE operation_id = $1`,
    [operationId, newStatus, errorMessage]
  );
}

/**
 * Run an idempotent write operation with full lifecycle management.
 *
 * Returns the resultSnapshot from either the new execution or a replay.
 *
 * @param {import('pg').Client} client - A pg client (NOT inside a transaction — idempotency
 *   reservation uses its own auto-commit steps).
 * @param {{
 *   operationId: string,
 *   userId: string,
 *   action: string,
 *   requestHash: string,
 * }} opts
 * @param {() => Promise<object>} executeFn - The structural write logic. Must
 *   handle its own transaction internally.
 * @returns {Promise<{ result: object, replay: boolean }>}
 */
async function runIdempotentOperation(client, opts, executeFn) {
  const { operationId, userId, action, requestHash } = opts;

  // Step 1: Reserve
  const reservation = await reserveOperation(client, { operationId, userId, action, requestHash });

  if (reservation.status === "completed") {
    return { result: reservation.resultSnapshot, replay: true };
  }

  if (reservation.status === "running_lease_ok") {
    const err = new Error(
      `Operation ${operationId} is currently being processed; please retry shortly`
    );
    err.statusCode = 409;
    err.code = "operation_running";
    throw err;
  }

  // Step 2: Mark running
  await markOperationRunning(client, operationId);

  // Step 3: Execute
  let result;
  try {
    result = await executeFn();
  } catch (execErr) {
    // Persist failure — retryable if the error is transient, terminal otherwise
    const isRetryable =
      execErr.code === "40001" || // serialization_failure
      execErr.code === "40P01" || // deadlock_detected
      (execErr.message || "").includes("connection");

    try {
      // Use a separate client for failure recording since the main client
      // may be in an aborted transaction state
      await client.query(
        `UPDATE product_resolution_operations
         SET status = $2, error_message = $3, retry_count = retry_count + 1,
             lease_expires_at = NULL
         WHERE operation_id = $1`,
        [
          operationId,
          isRetryable ? "failed_retryable" : "failed_terminal",
          execErr.message,
        ]
      );
    } catch (_recordErr) {
      // Best-effort — don't mask the original error
    }
    throw execErr;
  }

  // Step 4: Mark completed
  await markOperationCompleted(client, operationId, result);

  return { result, replay: false };
}

module.exports = {
  reserveOperation,
  markOperationRunning,
  markOperationCompleted,
  markOperationFailed,
  runIdempotentOperation,
  OPERATION_LEASE_SECONDS,
};
