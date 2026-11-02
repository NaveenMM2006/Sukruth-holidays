/** Lets pages render an empty state instead of crashing when the database is not configured yet. */
export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[data]", (err as Error).message);
    return fallback;
  }
}
