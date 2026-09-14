import { estimateDelivery } from "./deliveryEstimate";
import { createOrderId } from "./ids";
import { loadOrders, saveOrders } from "./persistence";
import { sanitizeAccount, sanitizeShipping } from "./validation";
import {
  fail,
  ok,
  type CreateStartNowOrderInput,
  type StartNowOrder,
  type StartNowRepository,
  type StartNowResult,
} from "./types";

function buildOrder(input: CreateStartNowOrderInput, now = new Date()): StartNowOrder {
  const createdAt = now.toISOString();
  return {
    id: createOrderId(),
    idempotencyKey: input.idempotencyKey,
    status: "confirmed",
    createdAt,
    updatedAt: createdAt,
    demoBookingId: input.demoBookingId ?? null,
    account: sanitizeAccount(input.account),
    equipment: [...input.equipment],
    device: input.device,
    shipping: sanitizeShipping(input.shipping),
    delivery: estimateDelivery(input.shipping, now),
    payment: {
      method: input.paymentMethod,
      simulated: true,
      authorizedAt: createdAt,
    },
    passwordSet: false,
  };
}

export function createLocalStartNowRepository(): StartNowRepository {
  return {
    adapter: "local",

    async authorizeAndCreateOrder(input) {
      const orders = loadOrders();
      const existing = orders.find((item) => item.idempotencyKey === input.idempotencyKey);
      if (existing) {
        return ok(existing);
      }

      const order = buildOrder(input);
      const written = saveOrders([...orders, order]);
      if (!written) {
        return fail("STORAGE", "We could not save this order in this browser.");
      }
      return ok(order);
    },

    async getOrder(id) {
      return ok(loadOrders().find((item) => item.id === id) ?? null);
    },

    async getOrderByIdempotencyKey(key) {
      return ok(loadOrders().find((item) => item.idempotencyKey === key) ?? null);
    },

    async listOrders() {
      return ok(loadOrders());
    },

    async markPasswordSet(id) {
      const orders = loadOrders();
      const index = orders.findIndex((item) => item.id === id);
      if (index < 0) {
        return fail("NOT_FOUND", "We could not find that local order.");
      }

      const current = orders[index];
      if (current.passwordSet && current.status !== "confirmed") {
        return ok(current);
      }

      const updated: StartNowOrder = {
        ...current,
        passwordSet: true,
        status: current.status === "complete" ? "complete" : "password_set",
        updatedAt: new Date().toISOString(),
      };
      const next = [...orders];
      next[index] = updated;
      const written = saveOrders(next);
      if (!written) {
        return fail("STORAGE", "We could not update this order in this browser.");
      }
      return ok(updated);
    },

    async markComplete(id) {
      const orders = loadOrders();
      const index = orders.findIndex((item) => item.id === id);
      if (index < 0) {
        return fail("NOT_FOUND", "We could not find that local order.");
      }

      const current = orders[index];
      if (!current.passwordSet) {
        return fail("VALIDATION", "Set a password before finishing setup.");
      }
      if (current.status === "complete") {
        return ok(current);
      }

      const updated: StartNowOrder = {
        ...current,
        status: "complete",
        updatedAt: new Date().toISOString(),
      };
      const next = [...orders];
      next[index] = updated;
      const written = saveOrders(next);
      if (!written) {
        return fail("STORAGE", "We could not update this order in this browser.");
      }
      return ok(updated);
    },
  };
}

/**
 * Reserved adapter for a future Netlify Function + Neon Postgres implementation.
 *
 * This factory never reads environment secrets and never opens a database
 * connection. Swap it in through `createStartNowRepository("netlify-neon")`
 * once the function exists.
 *
 * Expected future contract:
 *   POST /.netlify/functions/start-now
 *   GET  /.netlify/functions/start-now/:id
 *   POST /.netlify/functions/start-now/:id/password-set
 *   POST /.netlify/functions/start-now/:id/complete
 */
export function createNetlifyNeonStartNowRepository(): StartNowRepository {
  const notImplemented = <T>(): StartNowResult<T> =>
    fail(
      "NOT_IMPLEMENTED",
      "The Netlify/Neon Start Now adapter is not wired yet. Use the local adapter.",
    );

  return {
    adapter: "netlify-neon",
    async authorizeAndCreateOrder() {
      return notImplemented();
    },
    async getOrder() {
      return notImplemented();
    },
    async getOrderByIdempotencyKey() {
      return notImplemented();
    },
    async listOrders() {
      return notImplemented();
    },
    async markPasswordSet() {
      return notImplemented();
    },
    async markComplete() {
      return notImplemented();
    },
  };
}

export type StartNowAdapterKind = "local" | "netlify-neon";

export function createStartNowRepository(kind: StartNowAdapterKind = "local"): StartNowRepository {
  if (kind === "netlify-neon") {
    return createNetlifyNeonStartNowRepository();
  }
  return createLocalStartNowRepository();
}
