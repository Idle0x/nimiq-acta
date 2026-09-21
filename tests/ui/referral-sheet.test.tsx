// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
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

  it("hides redeem input and shows badge if user already claimed", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        link: "https://test.link",
        code: "MYCODE",
        alreadyClaimed: true,
        claimedReferrerCode: "FRIEND88",
      }),
    });

    render(
      <ReferralSheet open={true} onClose={() => {}} address="NQ10 05XT YLN6 1H4P SEDE PY2A L9AF" />
    );

    await waitFor(() => {
      expect(screen.queryByPlaceholderText("Enter Code (e.g. 7A1F2C)")).toBeNull();
      expect(screen.queryByText("Claim 10 NIM")).toBeNull();
      expect(screen.getByText(/You have redeemed code "FRIEND88"/i)).toBeDefined();
    });
  });

  it("allows claiming once, then hides input and displays confirmation badge", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          link: "https://test.link",
          code: "MYCODE",
          alreadyClaimed: false,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          rewardNIM: 10,
          message: "Claimed successfully",
        }),
      });

    render(
      <ReferralSheet open={true} onClose={() => {}} address="NQ10 05XT YLN6 1H4P SEDE PY2A L9AF" />
    );

    const input = await screen.findByPlaceholderText("Enter Code (e.g. 7A1F2C)");
    const claimBtn = screen.getByText("Claim 10 NIM");

    fireEvent.change(input, { target: { value: "SPECIAL9" } });
    fireEvent.click(claimBtn);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText("Enter Code (e.g. 7A1F2C)")).toBeNull();
      expect(screen.queryByText("Claim 10 NIM")).toBeNull();
      expect(screen.getByText(/You have redeemed code "SPECIAL9"/i)).toBeDefined();
    });
  });
});
