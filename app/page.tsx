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
  discountedCollateral,
  newId,
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

function categoryBadge(listing: Listing) {
  const labels: Record<string, string> = {
    tools: "Tools", transport: "Transport", electronics: "Electronics", sports: "Sports",
    household: "Household", photo: "Photo", delivery: "Delivery", survey: "Survey",
    cleanup: "Cleanup", other: "Other",
  };
  return labels[listing.category ?? "other"] ?? "Other";
}

function timeRemaining(expiresAt: number | undefined) {
  if (!expiresAt) return "Indefinite";
  const ms = expiresAt - Date.now();
  if (ms <= 0) return "Expired";
  const hrs = Math.floor(ms / (1000 * 60 * 60));
  if (hrs > 48) return `${Math.floor(hrs / 24)} days left`;
  if (hrs > 0) return `${hrs} hours left`;
  const mins = Math.floor(ms / (1000 * 60));
  return `${mins} mins left`;
}

export default function Home() {
  const { status, accounts, sendLock } = useNimiq();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("radar");
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [dashboard, setDashboard] = useState<{price: number, stats: any} | null>(null);

  const [loading, setLoading] = useState(true);
  const [wizard, setWizard] = useState<Listing | null>(null);
  const [locking, setLocking] = useState(false);
  const [qrToken, setQrToken] = useState<{ token: string; escrow: Escrow } | null>(null);
  const [lenderKeys, setLenderKeys] = useState<Record<string, { pub: string; priv: string }>>({});
  const [showScanner, setShowScanner] = useState(false);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const borrower = accounts[0] ?? "Anonymous";
  const isConnected = status === "connected";

  // Real Trust Score (0-100)
  const trustScore = useMemo(() => {
    const released = escrows.filter((e) => e.state === "released").length;
    return Math.min(100, 0 + released * 18 + Math.min(25, escrows.length * 3));
  }, [escrows]);

  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined" && !localStorage.getItem("acta.onboarded")) {
        setShowOnboarding(true);
      }
    } catch {}
  }, []);

  // Fetch true Database State
  useEffect(() => {
    let cancelled = false;
    
    fetch("/api/dashboard").then(r => r.json()).then(d => {
      if(!cancelled && d.price) setDashboard(d);
    }).catch(() => {});

    fetch("/api/escrows")
      .then((r) => r.json())
      .then((d: { listings?: Listing[]; escrows?: Escrow[]; shared?: boolean }) => {
        if (cancelled || !d) return;
        if (Array.isArray(d.listings)) setListings(d.listings);
        if (Array.isArray(d.escrows)) setEscrows(d.escrows);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
      
    return () => { cancelled = true; };
  }, []);

  const activeCount = escrows.filter((e) => e.state === "locked").length;

  async function handleLock(listing: Listing, amountNIM: number) {
    setLocking(true);
    try {
      const txHash = await sendLock({
        recipient: ESCROW_VAULT,
        value: Math.round(amountNIM * 100_000),
        fee: 0,
      });
      const e: Escrow = {
        id: newId("esc"),
        listingId: listing.id,
        title: listing.title,
        borrower,
        amountNIM,
        feeNIM: MICRO_FEE_NIM,
        yieldNIM: listing.yieldNIM || 0,
        state: "locked",
        txHash,
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * (listing.durationDays || 1),
        description: listing.description,
      };
      
      setEscrows((p) => [e, ...p]);
      await fetch("/api/escrows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "escrow", payload: e }),
      });
      
      setTab("active");
      toast(`Locked ${amountNIM.toLocaleString()} NIM for ${listing.title}`, "success");
      return e;
    } catch (err) {
      toast(err instanceof Error ? err.message : "Lock failed", "error");
      return null;
    } finally {
      setLocking(false);
    }
  }

  async function handleMakeLenderQr(escrow: Escrow) {
    let keys = lenderKeys[escrow.id];
    if (!keys) {
      const kp = await generateLenderKeypair();
      keys = { pub: kp.publicKeyHex, priv: kp.privateKeyHex };
      setLenderKeys((p) => ({ ...p, [escrow.id]: keys! }));
      setEscrows((p) => p.map((e) => (e.id === escrow.id ? { ...e, lenderPubkey: kp.publicKeyHex } : e)));
      
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

  const handleScan = useCallback(
    async (token: string) => {
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
          toast(`Released ${(e.amountNIM - e.feeNIM).toLocaleString()} NIM (${e.title})`, "success");
          return;
        }
      }
      toast("No matching escrow found.", "error");
    },
    [escrows, toast]
  );

  async function handleCreateListing(data: any) {
    const listing: Listing = {
      id: newId("list"),
      title: data.title,
      owner: borrower,
      collateralNIM: data.collateralNIM,
      yieldNIM: data.yieldNIM || 0,
      durationDays: data.durationDays || 1,
      kind: data.kind,
      category: data.category || "other",
      description: data.description,
      createdAt: Date.now(),
      isActive: true
    };

    setListings((p) => [listing, ...p]);
    setShowCreateListing(false);
    toast("Listing deployed to network.", "success");
    
    fetch("/api/escrows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "listing", payload: listing }),
    }).catch(console.error);
  }

  if (status === "loading") {
    return (
      <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-pulse">
         <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-full flex items-center justify-center mb-6">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
         </div>
         <h2 className="text-xl font-bold mb-2 text-white">Initializing Protocol</h2>
         <p className="text-slate-400 text-sm">Connecting to Nimiq Pay Engine...</p>
      </div>
    );
  }

  if (status === "error" && !isConnected) {
    return (
      <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
          <LockIcon size={28} className="text-slate-950" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white">Universal Fallback</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-[280px]">
          Acta is a native Mini App designed for Nimiq Pay. Since you are in a standard browser, connect using the universal Nimiq Hub to test the protocol.
        </p>
        <button 
          onClick={async () => {
            try {
              const hub = new HubApi("https://hub.nimiq-testnet.com");
              const res = await hub.chooseAddress({ appName: "Acta Protocol" });
              if(res) window.location.reload(); 
            } catch(e) {
              console.error(e);
            }
          }}
          className="w-full max-w-[260px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition-colors"
        >
          Connect Nimiq Hub
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-screen w-full bg-slate-950 text-slate-50 flex flex-col font-sans selection:bg-amber-500/30 overflow-hidden">
        <header className="px-5 pt-8 pb-4 flex justify-between items-center bg-gradient-to-b from-slate-950/80 to-transparent z-10 backdrop-blur-sm shrink-0">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-br from-amber-300 to-amber-600 bg-clip-text text-transparent">Acta</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">
              Zero-Trust Protocol
            </p>
          </div>
          <button
            onClick={() => setShowCreateListing(true)}
            className="flex h-10 items-center gap-2 rounded-full bg-white/5 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 btn-press border border-white/10"
          >
            <PlusIcon size={16} /> New
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-24 no-scrollbar">
          
          {tab === "radar" && (
            <div className="pb-10 animate-fade-in">
              {dashboard && (
                <div className="mb-8 grid grid-cols-2 gap-3">
                  <div className="card p-4 rounded-2xl relative overflow-hidden group border border-emerald-500/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-50" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">Total Value Locked</p>
                    <p className="text-2xl font-bold tnum text-white">{dashboard.stats.tvl_nim.toLocaleString()} NIM</p>
                    <p className="text-xs text-slate-400 mt-1">~${(dashboard.stats.tvl_nim * dashboard.price).toFixed(2)} USD</p>
                  </div>
                  <div className="card p-4 rounded-2xl relative overflow-hidden group border border-blue-500/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-50" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">30-Day Volume</p>
                    <p className="text-2xl font-bold tnum text-white">{dashboard.stats.volume_30d.toLocaleString()} NIM</p>
                    <p className="text-xs text-slate-400 mt-1">{dashboard.stats.escrows_30d} contracts executed</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <ZapIcon size={14} className="text-amber-400" /> Earn NIM (Bounties)
                </h3>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-6 mb-2 no-scrollbar snap-x">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
                ) : listings.filter(l => l.kind === "bounty").length === 0 ? (
                  <EmptyState title="No Bounties" subtitle="No bounties available. Create one!" icon={<ZapIcon size={32} />} />
                ) : (
                  listings.filter(l => l.kind === "bounty").map(l => (
                    <div key={l.id} className="min-w-[280px] snap-center card-bounty p-5 rounded-2xl flex flex-col justify-between border border-amber-500/20">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full">{categoryBadge(l)}</span>
                          <div className="text-right">
                            <p className="text-lg font-bold tnum text-amber-400">{l.collateralNIM.toLocaleString()} NIM</p>
                            {dashboard && <p className="text-[10px] text-amber-400/70">~${(l.collateralNIM * dashboard.price).toFixed(2)} USD</p>}
                          </div>
                        </div>
                        <h4 className="font-semibold text-lg leading-tight mb-2 text-white">{l.title}</h4>
                        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{l.description}</p>
                      </div>
                      <button
                        onClick={() => setWizard(l)}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all btn-press shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                      >
                        Accept Bounty
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between mb-4 mt-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <MapPinIcon size={14} className="text-blue-400" /> Available Nearby (Borrow)
                </h3>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                ) : listings.filter(l => l.kind === "borrow").length === 0 ? (
                  <EmptyState title="No Items" subtitle="No items available to borrow." icon={<MapPinIcon size={32} />} />
                ) : (
                  listings.filter(l => l.kind === "borrow").map((l) => (
                    <div key={l.id} className="card-borrow p-5 rounded-2xl border border-blue-500/20">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-full">{categoryBadge(l)}</span>
                        <div className="text-right">
                          <p className="text-lg font-bold tnum text-blue-400 flex items-center justify-end gap-1">
                            <LockIcon size={14} />
                            {l.collateralNIM.toLocaleString()} NIM
                          </p>
                          {dashboard && <p className="text-[10px] text-blue-400/70">~${(l.collateralNIM * dashboard.price).toFixed(2)} USD</p>}
                        </div>
                      </div>
                      <h4 className="font-semibold text-lg leading-tight mb-2 text-white">{l.title}</h4>
                      <p className="text-xs text-slate-400 mb-4">{l.description}</p>
                      
                      <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl mb-5 border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                          <span className="text-xs font-bold text-white">{(l.owner || 'A').charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Lender Profile</p>
                          <p className="text-xs font-semibold text-white">{l.owner.slice(0, 16)}...</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] text-slate-400 uppercase tracking-wider">Yield req.</p>
                           <p className="text-xs font-bold text-emerald-400 tnum">+{l.yieldNIM || 50} NIM</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setWizard(l)}
                        className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-sm transition-all btn-press shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      >
                        Review Smart Contract
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === "active" && (
            <div className="space-y-4 animate-fade-in">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => <SkeletonEscrow key={i} />)
              ) : escrows.length === 0 ? (
                <EmptyState title="No Contracts" subtitle="No active contracts. Start a task or borrow an item!" icon={<CheckIcon size={32} />} />
              ) : (
                escrows.map((e) => (
                  <div key={e.id} className="card p-5 rounded-2xl">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">{e.title}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${
                          e.state === "locked" ? "bg-amber-300/15 text-amber-300" : "bg-emerald-400/15 text-emerald-300"
                        }`}>
                        {e.state}
                      </span>
                    </div>

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

                    <p className="tnum mt-2 text-2xl font-extrabold text-white">
                      {e.amountNIM.toLocaleString()} <span className="text-sm text-slate-400">NIM</span>
                    </p>
                    {dashboard && <p className="text-[10px] text-slate-500">~${(e.amountNIM * dashboard.price).toFixed(2)} USD</p>}

                    <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                      <span className="tnum">Tx: {e.txHash.slice(0, 16)}...</span>
                      <span>Fee: {e.feeNIM} NIM</span>
                    </div>

                    {e.state === "locked" && (
                      <>
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                          <ClockIcon size={12} />
                          <span>{timeRemaining(e.expiresAt)}</span>
                        </div>
                        
                        {listings.find(l => l.id === e.listingId)?.kind === "bounty" ? (
                          <BountyVerify task={e.title} />
                        ) : (
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => handleMakeLenderQr(e)}
                              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400 transition-all hover:bg-amber-500/20 btn-press"
                            >
                              <StarIcon size={14} /> Show return QR
                            </button>
                            <button
                              onClick={() => setShowScanner(true)}
                              className="flex items-center gap-2 rounded-xl bg-sky-400/15 px-5 py-3 text-sm font-semibold text-sky-300 transition-all hover:bg-sky-400/25 btn-press"
                            >
                              <ScanIcon size={14} /> Scan
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "passport" && (
            <div className="space-y-4 animate-fade-in">
              <div className="card rounded-3xl p-6 text-center border border-white/5">
                <div className="flex justify-center">
                  <TrustRing score={trustScore} size={160} />
                </div>
                <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                  Every contract successfully returned builds your on-chain reputation. Higher trust tiers unlock massive collateral discounts.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-black/40 p-4 border border-white/5">
                    <p className="tnum text-xl font-black text-white">{escrows.length}</p>
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">Contracts</p>
                  </div>
                  <div className="rounded-2xl bg-black/40 p-4 border border-white/5">
                    <p className="tnum text-xl font-black text-emerald-400">
                      {escrows.filter((e) => e.state === "released").length}
                    </p>
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">Settled</p>
                  </div>
                  <div className="rounded-2xl bg-black/40 p-4 border border-white/5">
                    <p className="tnum text-xl font-black text-amber-400">{activeCount}</p>
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">Active</p>
                  </div>
                </div>
              </div>

              <div className="card rounded-2xl p-5 space-y-4 border border-white/5">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <WifiIcon size={14} className={isConnected ? "text-emerald-400" : "text-slate-500"} />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Connection State</p>
                </div>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs uppercase tracking-wider">Address</span>
                    <span className="tnum text-xs font-mono bg-black px-2 py-1 rounded-md">{borrower.slice(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs uppercase tracking-wider">Mode</span>
                    {isConnected ? (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">Connected</span>
                    ) : (
                      <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">Waiting...</span>
                    )}
                  </div>
                </div>
              </div>

              {escrows.length > 0 && (
                <div className="card rounded-2xl p-5 border border-white/5">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-white/5">
                    Global Ledger History
                  </p>
                  <div className="space-y-3">
                    {escrows.slice(0, 10).map((e) => (
                      <div key={e.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${e.state === 'locked' ? 'bg-amber-400/10 text-amber-400' : 'bg-emerald-400/10 text-emerald-400'}`}>
                            {e.state === "locked" ? <LockIcon size={14} /> : <CheckIcon size={14} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{e.title}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {new Date(e.createdAt).toLocaleDateString()} · {e.txHash.slice(0,8)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="tnum text-sm font-bold text-white">
                            {e.amountNIM.toLocaleString()} NIM
                          </p>
                          {dashboard && <p className="text-[9px] text-slate-500">~${(e.amountNIM * dashboard.price).toFixed(2)} USD</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <BottomTabs tab={tab} setTab={setTab} activeCount={activeCount} />

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
          <QrOverlay token={qrToken.token} escrow={qrToken.escrow} onClose={() => setQrToken(null)} />
        )}
        {showScanner && (
          <QrScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
        )}
        {showCreateListing && (
          <CreateListing onSubmit={handleCreateListing} onClose={() => setShowCreateListing(false)} />
        )}
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      </div>
    </ErrorBoundary>
  );
}
