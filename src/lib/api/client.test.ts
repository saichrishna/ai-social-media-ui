import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ApiError,
  USER_SAFE_ERROR_MESSAGE,
  apiFetch,
} from "@/lib/api/client";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("apiFetch error mapping", () => {
  it("maps FastAPI detail to a user-safe ApiError and logs detail only", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const error = await apiFetch("/users/missing").catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      message: USER_SAFE_ERROR_MESSAGE,
      userMessage: USER_SAFE_ERROR_MESSAGE,
    });
    expect((error as ApiError).message).not.toContain("User not found");
    expect(consoleError).toHaveBeenCalledWith("API error detail:", "User not found");
  });

  it("does not expose network failure messages to callers", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("ECONNREFUSED 127.0.0.1:8000")),
    );

    const error = await apiFetch("/users/1").catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).message).toBe(USER_SAFE_ERROR_MESSAGE);
    expect((error as ApiError).message).not.toContain("ECONNREFUSED");
  });
});
