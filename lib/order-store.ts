import type { Order } from './types';

/**
 * In-memory launch-stage persistence (no database by design):
 *  - pending Pagopar orders, kept so the webhook can re-fire the full order
 *    as 'pagado_online' on confirmation. Lost on restart — the webhook then
 *    falls back to a minimal update payload (orderId is always present).
 *  - LRU of processed webhook hashes for idempotency, backed up by the
 *    Google Sheets row check.
 */

const PENDING_TTL_MS = 3 * 24 * 60 * 60 * 1000; // matches Pagopar's fecha_maxima_pago window
const MAX_PENDING = 500;
const MAX_PROCESSED = 1000;

const pendingOrders = new Map<string, { order: Order; expiresAt: number }>();
const processedHashes = new Map<string, true>(); // Map preserves insertion order → cheap LRU

export function savePendingOrder(order: Order): void {
  const now = Date.now();
  for (const [id, entry] of pendingOrders) {
    if (entry.expiresAt < now) pendingOrders.delete(id);
  }
  while (pendingOrders.size >= MAX_PENDING) {
    const oldest = pendingOrders.keys().next().value;
    if (oldest === undefined) break;
    pendingOrders.delete(oldest);
  }
  pendingOrders.set(order.orderId, { order, expiresAt: now + PENDING_TTL_MS });
}

export function getPendingOrder(orderId: string): Order | undefined {
  const entry = pendingOrders.get(orderId);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    pendingOrders.delete(orderId);
    return undefined;
  }
  return entry.order;
}

export function markHashProcessed(hash: string): void {
  processedHashes.delete(hash);
  processedHashes.set(hash, true);
  while (processedHashes.size > MAX_PROCESSED) {
    const oldest = processedHashes.keys().next().value;
    if (oldest === undefined) break;
    processedHashes.delete(oldest);
  }
}

export function isHashProcessed(hash: string): boolean {
  return processedHashes.has(hash);
}
