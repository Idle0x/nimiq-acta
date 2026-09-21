// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import ReferralSheet from "@/components/ReferralSheet";
import React from "react";

describe("ReferralSheet", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders when open is true", () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ link: "https://test.link", code: "ABC" }),
    });

    const { container } = render(
      <ReferralSheet open={true} onClose={() => {}} address="NQ10 05XT YLN6 1H4P SEDE PY2A L9AF" />
    );
    expect(container).toBeDefined();
    expect(screen.getByText("You both earn 10 NIM.")).toBeDefined();
  });

  it("handles fetch 401 unauthenticated without crashing", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "Not authenticated" }),
    });

    const { container } = render(
      <ReferralSheet open={true} onClose={() => {}} address="NQ10 05XT YLN6 1H4P SEDE PY2A L9AF" />
    );
    expect(container).toBeDefined();
  });
});
