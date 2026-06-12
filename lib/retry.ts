/** Retry an async operation with exponential backoff (default 3 attempts: 0s, 1s, 2s, 4s...). */
export async function withRetry<T>(
  label: string,
  fn: () => Promise<T>,
  attempts = 3,
  baseDelayMs = 1000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        const delay = baseDelayMs * 2 ** (attempt - 1);
        console.warn(`[retry] ${label} failed (attempt ${attempt}/${attempts}), retrying in ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}
