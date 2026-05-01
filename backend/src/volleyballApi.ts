const volleyballApiBaseUrl = "https://v1.volleyball.api-sports.io/";

type VolleyballQueryValue = string | number | boolean | null | undefined;
type VolleyballApiError = Error & {
  status?: number;
  details?: unknown;
};

function createVolleyballApiError(
  message: string,
  status: number,
  details?: unknown,
) {
  const error = new Error(message) as VolleyballApiError;

  error.status = status;
  error.details = details;

  return error;
}

function getVolleyballApiKey() {
  const apiKey = process.env.VOLLEYBALL_API_KEY;

  if (!apiKey) {
    throw createVolleyballApiError(
      "VOLLEYBALL_API_KEY is not configured",
      503,
      {
        code: "VOLLEYBALL_API_KEY_MISSING",
        hint: "Set VOLLEYBALL_API_KEY in backend/.env for local runs or provide it to Docker Compose.",
      },
    );
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

  const apiKey = getVolleyballApiKey();
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey,
      },
    });
  } catch (cause) {
    throw createVolleyballApiError(
      "Could not reach the Volleyball API",
      502,
      {
        code: "VOLLEYBALL_API_UNREACHABLE",
        cause: cause instanceof Error ? cause.message : String(cause),
      },
    );
  }

  const data = await response.json().catch(() => ({
    message: "The Volleyball API returned a non-JSON response",
  }));

  if (!response.ok) {
    const errorMessage =
      typeof data?.message === "string"
        ? data.message
        : "Volleyball API request failed";

    throw createVolleyballApiError(errorMessage, response.status, data);
  }

  return data;
}
