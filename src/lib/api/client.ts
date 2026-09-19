export const USER_SAFE_ERROR_MESSAGE = "Something went wrong";

export const DEFAULT_API_TIMEOUT_MS = 20_000;

export class ApiError extends Error {
  readonly status: number;
  readonly userMessage: string;

  constructor(status: number, userMessage: string = USER_SAFE_ERROR_MESSAGE) {
    super(userMessage);
    this.name = "ApiError";
    this.status = status;
    this.userMessage = userMessage;
  }
}

export type ApiFetchOptions = Omit<RequestInit, "signal"> & {
  timeoutMs?: number;
};

function resolveUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (typeof window === "undefined") {
    const origin = (
      process.env.BACKEND_ORIGIN ?? "http://127.0.0.1:8000"
    ).replace(/\/$/, "");
    return `${origin}${normalizedPath}`;
  }

  return normalizedPath;
}

function extractFastApiDetail(body: unknown): unknown {
  if (body && typeof body === "object" && "detail" in body) {
    return (body as { detail: unknown }).detail;
  }
  return undefined;
}

function toUserSafeError(status: number): ApiError {
  return new ApiError(status, USER_SAFE_ERROR_MESSAGE);
}

async function parseJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { timeoutMs = DEFAULT_API_TIMEOUT_MS, headers, ...init } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }
  if (init.body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(resolveUrl(path), {
      ...init,
      headers: requestHeaders,
      credentials: "same-origin",
      signal: controller.signal,
    });

    const body = await parseJsonBody(response);

    if (!response.ok) {
      const detail = extractFastApiDetail(body);
      if (detail !== undefined) {
        console.error("API error detail:", detail);
      } else {
        console.error("API error:", response.status);
      }
      throw toUserSafeError(response.status);
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("API request failed:", error);
    throw toUserSafeError(0);
  } finally {
    clearTimeout(timeoutId);
  }
}
