const API_URL = import.meta.env.VITE_API_URL || "";

export async function api<T>(
  path: string,
  body?: unknown
): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers:
      body === undefined
        ? undefined
        : { "Content-Type": "application/json" },
    body: body === undefined
      ? undefined
      : JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to connect. Please try again."
    );
  }

  return data as T;
}