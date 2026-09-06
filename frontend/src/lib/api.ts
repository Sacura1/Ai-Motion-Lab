// Vite replaces this value during the frontend build. Accept either
// https://api.example.com or https://api.example.com/api to avoid /api/api.
const API_URL = (import.meta.env.VITE_API_URL || "")
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

export async function api<T>(
  path: string,
  body?: unknown
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers:
        body === undefined
          ? undefined
          : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Checkout could not reach the payment server. Please try again shortly.",
    );
  }

  const data = (await response.json().catch(() => ({}))) as { error?: string };

  if (!response.ok) {
    throw new Error(
      data.error || "The payment server returned an unexpected response."
    );
  }

  return data as T;
}
