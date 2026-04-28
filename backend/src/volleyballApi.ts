const volleyballApiBaseUrl = "https://v1.volleyball.api-sports.io/";

type VolleyballQueryValue = string | number | boolean | null | undefined;

function getVolleyballApiKey() {
  const apiKey = process.env.VOLLEYBALL_API_KEY;

  if (!apiKey) {
    throw new Error("VOLLEYBALL_API_KEY is missing in backend/.env");
  }

  return apiKey;
}

export async function callVolleyballApi(
  path: string,
  query: Record<string, VolleyballQueryValue> = {},
) {
  const url = new URL(path.replace(/^\//, ""), volleyballApiBaseUrl);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: {
      "x-apisports-key": getVolleyballApiKey(),
    },
  });

  const data = await response.json().catch(() => ({
    message: "The Volleyball API returned a non-JSON response",
  }));

  if (!response.ok) {
    const errorMessage =
      typeof data?.message === "string"
        ? data.message
        : "Volleyball API request failed";

    const error = new Error(errorMessage) as Error & {
      status?: number;
      details?: unknown;
    };

    error.status = response.status;
    error.details = data;

    throw error;
  }

  return data;
}
