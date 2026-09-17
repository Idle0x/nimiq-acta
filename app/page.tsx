"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import BottomTabs, { type Tab } from "@/components/BottomTabs";
import BorrowWizard from "@/components/BorrowWizard";
import BountyVerify from "@/components/BountyVerify";
import QrOverlay from "@/components/QrOverlay";
import QrScanner from "@/components/QrScanner";
import CreateListing from "@/components/CreateListing";
import Onboarding from "@/components/Onboarding";
import TrustRing from "@/components/TrustRing";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SkeletonCard, SkeletonEscrow } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import HubApi from "@nimiq/hub-api";
import {
  RadarIcon,
  LockIcon,
  UnlockIcon,
  ScanIcon,
  PlusIcon,
  SearchIcon,
  WifiIcon,
  WifiOffIcon,
  ClockIcon,
  CheckIcon,
  MapPinIcon,
  ZapIcon,
  StarIcon,
} from "@/components/icons";
import { useNimiq } from "@/lib/nimiq";
import {
  ESCROW_VAULT,
  MICRO_FEE_NIM,
  SEED_LISTINGS,
  discountedCollateral,
  loadEscrows,
  newEscrowId,
  saveEscrows,
  type Escrow,
  type Listing,
} from "@/lib/escrow";
import {
  generateLenderKeypair,
  createReturnPayload,
  signReturn,
  verifyReturn,
  type ReturnPayload,
} from "@/lib/qr";

// Category icon map
function categoryBadge(listing: Listing) {
  const labels: Record<string, string> = {
    tools: "Tools",
    transport: "Transport",
    electronics: "Electronics",
    sports: "Sports",
    household: "Household",
    photo: "Photo",
    delivery: "Delivery",
    survey: "Survey",
    cleanup: "Cleanup",
    other: "Other",
  };
  return labels[listing.category ?? "other"] ?? "Other";
}

export default function Home() {
  const { status, accounts, sendLock } = useNimiq();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("radar");
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const [dashboard, setDashboard] = useState<{price: number, stats: any} | null>(null);
  
  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => {
      if(d.price) setDashboard(d);
    }).catch(console.error);
  }, []);

  const [listings, setListings] = useState<Listing[]>(SEED_LISTINGS);
  const [shared, setShared] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wizard, setWizard] = useState<Listing | null>(null);
  const [locking, setLocking] = useState(false);
  const [scanMsg, setScanMsg] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<{ token: string; escrow: Escrow } | null>(null);
  const [lenderKeys, setLenderKeys] = useState<Record<string, { pub: string; priv: string }>>({});
  const [showScanner, setShowScanner] = useState(false);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const borrower = accounts[0] ?? "connecting...";
  const isConnected = status === "connected";

  // Trust score calculation
  const trustScore = useMemo(() => {
    const released = escrows.filter((e) => e.state === "released").length;
    return Math.min(100, 0 + released * 18 + Math.min(25, escrows.length * 3));
  }, [escrows]);

  // Initial client-side load
  useEffect(() => {
    setIsMounted(true);
    setEscrows(loadEscrows());
    
    try {
      if (typeof localStorage !== "undefined" && !localStorage.getItem("acta.onboarded")) {
        setShowOnboarding(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist escrows
  useEffect(() => {
    if (isMounted) {
      saveEscrows(escrows);
    }
  }, [escrows, isMounted]);

  // Fetch shared order book
  useEffect(() => {
    let cancelled = false;
    fetch("/api/escrows")
      .then((r) => r.json())
      .then((d: { listings?: Listing[]; escrows?: Escrow[]; shared?: boolean }) => {
        if (cancelled || !d) return;
        if (Array.isArray(d.listings) && d.listings.length > 0) setListings(d.listings);
        if (d.shared === true && Array.isArray(d.escrows)) {
          setEscrows((local) => {
            const ids = new Set(local.map((e) => e.id));
            const merged = [...local];
            for (const e of d.escrows!) if (!ids.has(e.id)) merged.unshift(e);
            return merged;
          });
        }
        setShared(d.shared === true);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCount = escrows.filter((e) => e.state === "locked").length;

  // Lock handler
  async function handleLock(listing: Listing, amountNIM: number) {
    setLocking(true);
    try {
      const txHash = await sendLock({
        recipient: ESCROW_VAULT,
        value: Math.round(amountNIM * 100_000),
        fee: 0,
      });
      const e: Escrow = {
        id: newEscrowId(),
        listingId: listing.id,
        title: listing.title,
        borrower,
        amountNIM,
        feeNIM: MICRO_FEE_NIM,
        state: "locked",
        txHash,
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
        description: listing.description,
      };
      setEscrows((p) => [e, ...p]);
      fetch("/api/escrows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e),
      }).catch(() => {});
      setTab("active");
      toast(`Locked ${amountNIM.toLocaleString()} NIM for ${listing.title}`, "success");
      return e;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lock failed";
      toast(msg, "error");
      return null;
    } finally {
      setLocking(false);
    }
  }

  // Lender QR handler
  async function handleMakeLenderQr(escrow: Escrow) {
    let keys = lenderKeys[escrow.id];
    if (!keys) {
      const kp = await generateLenderKeypair();
      keys = { pub: kp.publicKeyHex, priv: kp.privateKeyHex };
      setLenderKeys((p) => ({ ...p, [escrow.id]: keys! }));
      setEscrows((p) =>
        p.map((e) => (e.id === escrow.id ? { ...e, lenderPubkey: kp.publicKeyHex } : e))
      );
      fetch("/api/escrows", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: escrow.id, lenderPubkey: kp.publicKeyHex }),
      }).catch(() => {});
    }
    const payload: ReturnPayload = createReturnPayload(escrow.id);
    const token = await signReturn(payload, keys.priv);
    setQrToken({ token, escrow });
  }

  // Scan & verify handler (for both QR scanner and manual paste)
  const handleScan = useCallback(
    async (token: string) => {
      setScanMsg(null);
      const t = token.trim();
      if (!t) return;
      for (const e of escrows) {
        if (e.state !== "locked" || !e.lenderPubkey) continue;
        const payload = await verifyReturn(t, e.lenderPubkey);
        if (payload && payload.escrowId === e.id) {
          setEscrows((p) => p.map((x) => (x.id === e.id ? { ...x, state: "released" } : x)));
          fetch("/api/escrows", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: e.id, state: "released" }),
          }).catch(() => {});
          setShowScanner(false);
          toast(
            `Released ${(e.amountNIM - e.feeNIM).toLocaleString()} NIM (${e.title})`,
            "success"
          );
          return;
        }
      }
      toast("No matching escrow found. Generate a lender QR first.", "error");
    },
    [escrows, toast]
  );

  // Create listing handler
  function handleCreateListing(data: {
    title: string;
    kind: "borrow" | "bounty";
    collateralNIM: number;
    description: string;
  }) {
    const newListing: Listing = {
      id: `user-${Date.now().toString(36)}`,
      title: data.title,
      owner: `You · 0.0km`,
      collateralNIM: data.collateralNIM,
      distanceKm: 0,
      kind: data.kind,
      description: data.description,
      category: data.kind === "borrow" ? "other" : "other",
      createdBy: borrower,
    };
    setListings((p) => [newListing, ...p]);
    // Persist to backend
    fetch("/api/escrows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing: newListing }),
    }).catch(() => {});
    setShowCreateListing(false);
    toast(`Listed "${data.title}" on Radar`, "success");
  }

  // Time remaining formatter
  function timeRemaining(expiresAt?: number): string {
    if (!expiresAt) return "No expiry";
    const diff = expiresAt - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-dvh flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0F172A]/95 px-4 pb-3 pt-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Acta <span className="text-gradient-gold">·</span>{" "}
                <span className="text-sm font-semibold text-slate-400">proof-of-action</span>
              </h1>
              <div className="mt-0.5 flex items-center gap-1.5">
                {isConnected ? (
                  <WifiIcon size={12} className="text-emerald-400" />
                ) : (
                  <WifiOffIcon size={12} className="text-slate-500" />
                )}
                <p className="text-xs text-slate-400">
                  {isConnected
                    ? "Nimiq Pay connected"
                    : "Not connected to wallet"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setTab("passport")}
              className="rounded-2xl border border-white/10 bg-slate-800/80 px-3 py-1.5 text-right transition-all hover:border-amber-300/30"
            >
              <p className="tnum text-sm font-extrabold text-white">{trustScore}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">trust</p>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="no-scrollbar flex-1 overflow-y-auto px-4 pb-28 pt-4">
          {/* RADAR TAB */}
          {tab === "radar" && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Nearby {shared ? "· shared" : "· local"}
                </p>
                <button
                  onClick={() => setShowCreateListing(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-all hover:border-amber-300/30 btn-press"
                >
                  <PlusIcon size={14} />
                  Post
                </button>
              </div>

              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : listings.length === 0 ? (
                <EmptyState
                  icon={<SearchIcon size={48} className="text-slate-600" />}
                  title="No listings nearby"
                  subtitle="Be the first to post an item or bounty."
                  action={{ label: "Post a listing", onClick: () => setShowCreateListing(true) }}
                />
              ) : (
                listings.map((l, idx) => (
                  <div
                    key={l.id}
                    className={`${
                      l.kind === "borrow" ? "card-borrow" : "card-bounty"
                    } rounded-2xl p-4 animate-fade-in`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              l.kind === "borrow"
                                ? "bg-sky-400/15 text-sky-300"
                                : "bg-amber-300/15 text-amber-300"
                            }`}
                          >
                            {l.kind === "borrow" ? "Borrow" : "Bounty"}
                          </span>
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                            {categoryBadge(l)}
                          </span>
                        </div>
                        <h2 className="mt-1.5 font-bold leading-tight">{l.title}</h2>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                          <MapPinIcon size={11} className="text-slate-500" />
                          {l.owner}
                        </p>
                        {l.description && (
                          <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                            {l.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="tnum text-lg font-extrabold text-white">
                          {discountedCollateral(l.collateralNIM, trustScore).toLocaleString()}
                        </p>
                        <p className="text-xs font-bold text-amber-300">NIM</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setWizard(l)}
                      className={`mt-3 w-full rounded-xl py-2.5 text-sm font-bold transition-transform btn-press ${
                        l.kind === "borrow"
                          ? "bg-sky-400 text-slate-950"
                          : "bg-amber-300 text-slate-950"
                      }`}
                    >
                      {l.kind === "borrow" ? "Borrow · Lock collateral" : "Accept bounty"}
                    </button>
                    {l.kind === "bounty" && <BountyVerify task={l.title} />}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ACTIVE TAB */}
          {tab === "active" && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Escrows · {activeCount} active
                </p>
                {activeCount > 0 && (
                  <button
                    onClick={() => setShowScanner(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-sky-300 transition-all hover:border-sky-400/30 btn-press"
                  >
                    <ScanIcon size={14} />
                    Scan QR
                  </button>
                )}
              </div>

              {loading ? (
                <>
                  <SkeletonEscrow />
                  <SkeletonEscrow />
                </>
              ) : escrows.length === 0 ? (
                <EmptyState
                  icon={<LockIcon size={48} className="text-slate-600" />}
                  title="No escrows yet"
                  subtitle="Go to Radar and lock your first collateral."
                  action={{ label: "Browse Radar", onClick: () => setTab("radar") }}
                />
              ) : (
                escrows.map((e, idx) => (
                  <div
                    key={e.id}
                    className={`${
                      e.state === "released" ? "card-success" : "card"
                    } rounded-2xl p-4 animate-fade-in`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {e.state === "locked" ? (
                          <LockIcon size={16} className="text-amber-300" />
                        ) : (
                          <UnlockIcon size={16} className="text-emerald-400" />
                        )}
                        <h2 className="font-bold">{e.title}</h2>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          e.state === "locked"
                            ? "bg-amber-300/15 text-amber-300"
                            : "bg-emerald-400/15 text-emerald-300"
                        }`}
                      >
                        {e.state.toUpperCase()}
                      </span>
                    </div>

                    
                    {/* STEPPER PROGRESS BAR */}
                    <div className="mt-6 mb-4 flex items-center justify-between relative px-2">
                       <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
                       <div className={`absolute top-1/2 left-4 h-0.5 -translate-y-1/2 z-0 transition-all duration-500 ${e.state === 'released' ? 'w-[calc(100%-2rem)] bg-emerald-500' : 'w-[calc(50%-1rem)] bg-amber-500'}`} />
                       
                       <div className="relative z-10 flex flex-col items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center border-4 border-slate-950">
                            <CheckIcon size={12} className="text-slate-950 font-bold" />
                          </div>
                          <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">Locked</span>
                       </div>
                       
                       <div className="relative z-10 flex flex-col items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-4 border-slate-950 transition-colors ${e.state === 'released' ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                             {e.state === 'released' && <CheckIcon size={12} className="text-slate-950 font-bold" />}
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${e.state === 'released' ? 'text-emerald-500' : 'text-slate-500'}`}>Returned</span>
                       </div>
                    </div>
                    
                    <p className="tnum mt-2 text-2xl font-extrabold">
                      {e.amountNIM.toLocaleString()}{" "}
                      <span className="text-sm text-amber-300">NIM</span>
                    </p>

                    <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="tnum break-all">{e.txHash.slice(0, 24)}...</span>
                      <span>Fee: {e.feeNIM} NIM</span>
                    </div>

                    {e.state === "locked" && (
                      <>
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                          <ClockIcon size={12} />
                          <span>{timeRemaining(e.expiresAt)}</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleMakeLenderQr(e)}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/15 py-2.5 text-sm font-semibold transition-all hover:border-amber-300/30 btn-press"
                          >
                            <StarIcon size={14} className="text-amber-300" />
                            Show return QR
                          </button>
                          <button
                            onClick={() => setShowScanner(true)}
                            className="flex items-center gap-2 rounded-xl bg-sky-400/15 px-4 py-2.5 text-sm font-semibold text-sky-300 transition-all hover:bg-sky-400/25 btn-press"
                          >
                            <ScanIcon size={14} />
                            Scan
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* PASSPORT TAB */}
          {tab === "passport" && (
            <div className="space-y-4 animate-fade-in">
              <div className="card rounded-3xl p-6 text-center">
                <div className="flex justify-center">
                  <TrustRing score={trustScore} size={160} />
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  Complete escrows to raise your score. Higher scores unlock collateral discounts up
                  to 30%.
                </p>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-slate-950/60 p-3">
                    <p className="tnum text-lg font-extrabold">{escrows.length}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Total</p>
                  </div>
                  <div className="rounded-2xl bg-slate-950/60 p-3">
                    <p className="tnum text-lg font-extrabold text-emerald-400">
                      {escrows.filter((e) => e.state === "released").length}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Released</p>
                  </div>
                  <div className="rounded-2xl bg-slate-950/60 p-3">
                    <p className="tnum text-lg font-extrabold text-amber-300">{activeCount}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Active</p>
                  </div>
                </div>
              </div>

              {/* Account info */}
              <div className="card rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <WifiIcon size={14} className={isConnected ? "text-emerald-400" : "text-slate-500"} />
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Account
                  </p>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Address</span>
                    <span className="tnum text-xs">{borrower}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vault</span>
                    <span className="tnum text-xs">{ESCROW_VAULT}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mode</span>
                    <span className="text-xs">
                      {isConnected ? (
                        <span className="text-emerald-400">Connected (Hub)</span>
                      ) : (
                        <span className="text-rose-400 font-semibold cursor-pointer" onClick={() => window.location.reload()}>Connect Wallet</span>
                      )}
                    </span>
                  </div>

                </div>
              </div>

              {/* Transaction history */}
              {escrows.length > 0 && (
                <div className="card rounded-2xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                    Recent Activity
                  </p>
                  <div className="space-y-2">
                    {escrows.slice(0, 5).map((e) => (
                      <div key={e.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-2">
                          {e.state === "locked" ? (
                            <LockIcon size={14} className="text-amber-300" />
                          ) : (
                            <CheckIcon size={14} className="text-emerald-400" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{e.title}</p>
                            <p className="text-[10px] text-slate-500">
                              {new Date(e.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="tnum text-sm font-bold">
                          {e.amountNIM.toLocaleString()} <span className="text-xs text-slate-500">NIM</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <BottomTabs tab={tab} setTab={setTab} activeCount={activeCount} />

        {/* Modals & Overlays */}
        {wizard && (
          <BorrowWizard
            listing={wizard}
            trustScore={trustScore}
            borrower={borrower}
            locking={locking}
            onLock={handleLock}
            onClose={() => setWizard(null)}
          />
        )}
        {qrToken && (
          <QrOverlay
            token={qrToken.token}
            escrow={qrToken.escrow}
            onClose={() => setQrToken(null)}
          />
        )}
        {showScanner && (
          <QrScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
        )}
        {showCreateListing && (
          <CreateListing
            onSubmit={handleCreateListing}
            onClose={() => setShowCreateListing(false)}
          />
        )}
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      </div>
    </ErrorBoundary>
  );
}
