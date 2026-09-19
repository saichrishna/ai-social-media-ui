import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/lib/api/client";
import {
  canInvokeSocialConnect,
  disconnectSocialAccount,
  invokeSocialConnectIfEnabled,
} from "@/lib/api/social-accounts";

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return {
    ...actual,
    apiFetch: vi.fn(),
  };
});

const apiFetchMock = vi.mocked(apiFetch);

beforeEach(() => {
  apiFetchMock.mockReset();
  apiFetchMock.mockResolvedValue({ success: true });
});

describe("disconnectSocialAccount", () => {
  it("DELETEs with user_id as a query parameter", async () => {
    await disconnectSocialAccount("account-1", "user-1");

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/social-accounts/account-1?user_id=user-1",
      { method: "DELETE" },
    );
    expect(apiFetchMock.mock.calls[0]?.[0]).toContain("user_id=user-1");
  });
});

describe("social connect gating", () => {
  it("does not invoke connect when social_publishing is false", () => {
    const connect = vi.fn();

    expect(canInvokeSocialConnect(false)).toBe(false);
    invokeSocialConnectIfEnabled(false, connect);

    expect(connect).not.toHaveBeenCalled();
  });
});
