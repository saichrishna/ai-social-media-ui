import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UserProvider, useUser, useUserId } from "@/lib/auth";

function Probe() {
  const user = useUser();
  const userId = useUserId();
  return (
    <div>
      <span data-testid="name">{user?.name ?? "none"}</span>
      <span data-testid="id">{userId ?? "none"}</span>
    </div>
  );
}

describe("useUser / useUserId", () => {
  it("reads identity from UserProvider, not from env", () => {
    render(
      <UserProvider
        user={{ id: "user-1", name: "Ada", email: "ada@example.com" }}
      >
        <Probe />
      </UserProvider>,
    );

    expect(screen.getByTestId("name")).toHaveTextContent("Ada");
    expect(screen.getByTestId("id")).toHaveTextContent("user-1");
  });
});
