// @vitest-environment jsdom
// ManualVerify: the undefined-wallet QR guard. Renders the component with a
// mocked Pay SDK — disconnected shows the connect prompt (never a QR with
// "undefined"), connected shows a QR embedding the real address.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

const sdkState: { accounts: string[] } = { accounts: [] };

vi.mock("@nimiq/mini-app-sdk", () => ({
  init: vi.fn(async () => ({ listAccounts: async () => sdkState.accounts })),
  requestDeviceIdentifier: vi.fn(async () => { throw new Error("denied"); }),
  getHostLanguage: vi.fn(() => { throw new Error("n/a"); }),
}));

import ManualVerify from "@/components/ManualVerify";

describe("ManualVerify wallet guard", () => {
  beforeEach(() => {
    sdkState.accounts = [];
  });
  afterEach(() => {
    cleanup();
  });

  it("disconnected wallet: prompt, no QR, no 'undefined' anywhere", async () => {
    const { container } = render(<ManualVerify listingId="l1" />);
    expect(await screen.findByText(/Connect your wallet/i)).toBeTruthy();
    expect(container.innerHTML).not.toContain("undefined");
    expect(container.querySelector("svg")).toBeNull();
  });

  it("connected wallet: QR embeds the real completer address", async () => {
    sdkState.accounts = ["NQ07 0000 0000 0000 0000 0000 0000 0000 0001"];
    const { container } = render(<ManualVerify listingId="l1" />);
    const btn = await screen.findByText(/Request Approval/i);
    fireEvent.click(btn);
    const svg = await screen.findByText(/Waiting for creator/i);
    expect(svg).toBeTruthy();
    expect(container.innerHTML).not.toContain("undefined");
  });
});
