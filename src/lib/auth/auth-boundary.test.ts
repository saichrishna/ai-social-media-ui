import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getBootstrapUser = vi.fn();

vi.mock("@/lib/auth/bootstrap-provider", () => ({
  getBootstrapUser,
}));

describe("auth boundary", () => {
  beforeEach(() => {
    getBootstrapUser.mockReset();
  });

  it("getCurrentUser uses the bootstrap provider", async () => {
    const user = { id: "user-1", name: "Ada", email: "ada@example.com" };
    getBootstrapUser.mockResolvedValue(user);

    const { getCurrentUser } = await import("@/lib/auth/get-current-user");
    await expect(getCurrentUser()).resolves.toEqual(user);
    expect(getBootstrapUser).toHaveBeenCalledOnce();
  });

  it("feature-facing auth modules do not read AUTH_BOOTSTRAP_USER_ID", () => {
    const root = process.cwd();
    const featureFacing = [
      "src/lib/auth/index.ts",
      "src/lib/auth/user-provider.tsx",
      "src/lib/auth/types.ts",
    ];

    for (const relativePath of featureFacing) {
      const source = readFileSync(path.join(root, relativePath), "utf8");
      expect(source).not.toMatch(/AUTH_BOOTSTRAP_USER_ID/);
      expect(source).not.toMatch(/bootstrap-provider/);
    }

    const bootstrap = readFileSync(
      path.join(root, "src/lib/auth/bootstrap-provider.ts"),
      "utf8",
    );
    expect(bootstrap).toMatch(/AUTH_BOOTSTRAP_USER_ID/);

    const getCurrentUserSource = readFileSync(
      path.join(root, "src/lib/auth/get-current-user.ts"),
      "utf8",
    );
    expect(getCurrentUserSource).toMatch(/bootstrap-provider/);
    expect(getCurrentUserSource).not.toMatch(/AUTH_BOOTSTRAP_USER_ID/);
  });
});
