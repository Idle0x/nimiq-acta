// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import ListingDetailSheet, { getListingMeta } from "@/components/ListingDetailSheet";

describe("ListingDetailSheet & Listing Metadata", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("getListingMeta accurately maps all listing types", () => {
    const geo = getListingMeta("bounty_geo");
    expect(geo.label).toBe("GPS Check-In");
    expect(geo.isBounty).toBe(true);
    expect(geo.oracleName).toContain("GPS");

    const qr = getListingMeta("bounty_qr");
    expect(qr.label).toBe("ScanQuest Token");
    expect(qr.isBounty).toBe(true);
    expect(qr.oracleName).toContain("QR");

    const manual = getListingMeta("bounty_manual");
    expect(manual.label).toBe("In-Person Verification");
    expect(manual.isBounty).toBe(true);
    expect(manual.oracleName).toContain("Sponsor");

    const venture = getListingMeta("bounty_venture");
    expect(venture.label).toBe("Online Venture");
    expect(venture.isBounty).toBe(true);

    const borrow = getListingMeta("borrow");
    expect(borrow.label).toBe("Equipment Loan");
    expect(borrow.isBounty).toBe(false);

    const vision = getListingMeta("bounty");
    expect(vision.label).toBe("Vision Oracle");
    expect(vision.isBounty).toBe(true);
    expect(vision.oracleName).toContain("Vision");
  });

  it("renders bounty challenger view with 0 NIM accept, coordinates, and collapsible dossier", async () => {
    const mockListingData = {
      listing: {
        id: "list-100",
        title: "Sunset Beach GPS Check-In",
        kind: "bounty_geo",
        category: "other",
        owner: "NQ01 OWNER 0001",
        collateralNIM: 50,
        description: "Verify presence at Sunset Beach pavilion.",
        yieldNIM: 0,
        durationDays: 1,
        targetLat: 34.0522,
        targetLng: -118.2437,
        requireLocation: true,
        state: "open",
        expiresAt: Date.now() + 86400000 * 5,
        contract: {
          criteria: "Take a step inside the pavilion boundary",
          deadlineHours: 48,
          minTrust: 0,
          expiresInHours: 120,
          geo: { lat: 34.0522, lng: -118.2437, radiusM: 30 },
          ai: { primary: "geo", presenceCheck: true, preScreen: false },
        },
        createdAt: Date.now() - 3600000 * 2,
      },
      sponsor: {
        address: "NQ01 OWNER 0001",
        trustScore: 45,
        joinedAt: Date.now() - 86400000 * 30,
        actsCount: 12,
        settledVolume: 1500,
        recentActs: [],
      },
      viewer: {
        isOwner: false,
        escrow: null,
        activeParticipants: 0,
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockListingData,
    } as any);

    const onAccept = vi.fn();
    const onClose = vi.fn();

    render(
      <ListingDetailSheet
        listingId="list-100"
        viewerTrust={10}
        onAccept={onAccept}
        onClose={onClose}
      />
    );

    // Should display GPS Check-In header
    expect(await screen.findByText("Sunset Beach GPS Check-In")).toBeTruthy();
    expect(screen.getAllByText("GPS Check-In").length).toBeGreaterThan(0);

    // Financials: Should show pre-funded bounty and 0 NIM cost to accept
    expect(screen.getByText("Bounty Prize (Pre-funded in Vault)")).toBeTruthy();
    expect(screen.getByText("0 NIM (Completely free)")).toBeTruthy();

    // Coordinates: Should show target coordinates and Open Maps
    expect(screen.getByText("34.0522, -118.2437")).toBeTruthy();
    expect(screen.getByText("Open Maps")).toBeTruthy();

    // Verification method & must-do
    expect(screen.getByText(/Take a step inside the pavilion boundary/i)).toBeTruthy();

    // Accepter button: Must be "Accept Bounty Challenge", NOT "Accept & lock"
    const acceptBtn = screen.getByRole("button", { name: /Accept Bounty Challenge/i });
    expect(acceptBtn).toBeTruthy();
    expect(screen.queryByText(/Accept & lock 50 NIM/i)).toBeNull();

    // Collapsible Dossier: Click to expand
    const toggleBtn = screen.getByText("Protocol Covenant & Operational Terms");
    fireEvent.click(toggleBtn);

    // FAQ questions should now be visible
    expect(await screen.findByText(/What happens next if I accept\?/i)).toBeTruthy();
    expect(screen.getByText(/What would I have to do\?/i)).toBeTruthy();
    expect(screen.getByText(/What does the platform or system do\?/i)).toBeTruthy();
    expect(screen.getByText(/ZERO CHARGES FOR CHALLENGERS/i)).toBeTruthy();

    // Clicking accept
    fireEvent.click(acceptBtn);
    expect(onAccept).toHaveBeenCalledWith(mockListingData.listing);
    expect(onClose).toHaveBeenCalled();
  });

  it("renders owner view with both Close and Cancel controls", async () => {
    const mockOwnerListing = {
      listing: {
        id: "list-200",
        title: "Sony A7 IV Camera Loan",
        kind: "borrow",
        category: "photo",
        owner: "NQ02 SPONSOR 0002",
        collateralNIM: 200,
        description: "Camera body in mint condition.",
        yieldNIM: 10,
        durationDays: 3,
        state: "open",
        expiresAt: null,
        contract: null,
        createdAt: Date.now() - 3600000,
      },
      sponsor: {
        address: "NQ02 SPONSOR 0002",
        trustScore: 80,
        joinedAt: Date.now() - 86400000 * 60,
        actsCount: 25,
        settledVolume: 5000,
        recentActs: [],
      },
      viewer: {
        isOwner: true,
        escrow: null,
        activeParticipants: 0,
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockOwnerListing,
    } as any);

    render(
      <ListingDetailSheet
        listingId="list-200"
        viewerTrust={80}
        onAccept={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(await screen.findByText("This is your listing.")).toBeTruthy();
    expect(screen.getByText("Close to New Accepts")).toBeTruthy();
    expect(screen.getByText(/Cancel & Full Refund/i)).toBeTruthy();
  });
});
