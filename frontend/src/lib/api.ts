// Vite replaces this value during the frontend build. A bare production
// hostname is upgraded to HTTPS so it cannot become a path on the website.
function normalizeApiUrl(value: string | undefined) {
  const configured = (value || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "");

  if (!configured) return "";
  return /^https?:\/\//i.test(configured)
    ? configured
    : `https://${configured}`;
}

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

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
