"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import BottomTabs, { type Tab } from "@/components/BottomTabs";
import BorrowWizard from "@/components/BorrowWizard";
import BountyVerify from "@/components/BountyVerify";
import { Leaderboard, ActivityFeed } from "@/components/LivenessLayer";
import { TreasuryCard } from "@/components/TreasuryCard";
import PassportDetails from "@/components/PassportDetails";
import { MapRadar } from "@/components/MapRadar";
import { SuccessPayoff } from "@/components/SuccessPayoff";
import CheckInVerify from "@/components/CheckInVerify";
import ManualVerify from "@/components/ManualVerify";
import VentureVerify from "@/components/VentureVerify";
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
  MIN_NETWORK_FEE_NIM,
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
  const { status, accounts, sendLock, signMessage } = useNimiq();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("radar");
  const [showMap, setShowMap] = useState(false);
  const [payoffAmount, setPayoffAmount] = useState<number | null>(null);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [dashboard, setDashboard] = useState<{price: number, stats: any, user?: any, feed?: any[], leaderboard?: any[]} | null>(null);

  const [loading, setLoading] = useState(true);
  const [wizard, setWizard] = useState<Listing | null>(null);
  const [locking, setLocking] = useState(false);
  const [qrToken, setQrToken] = useState<{ token: string; escrow: Escrow } | null>(null);
  const [lenderKeys, setLenderKeys] = useState<Record<string, { pub: string; priv: string }>>({});
  const [showScanner, setShowScanner] = useState(false);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const borrower = accounts[0] ?? "Anonymous";
  const isConnected = status === "connected" || isDemoMode;

  // Real Trust Score (0-100) from the server
  const trustScore = dashboard?.user?.trustScore || 0;

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
    const isAuthed = await ensureAuth();
    if (!isAuthed) {
      toast("Authentication required to lock funds", "error");
      return null;
    }

    setLocking(true);
    try {
      let txHash = "0x" + Date.now().toString(16);
      
      if (!listing.kind.startsWith("bounty")) {
        txHash = await sendLock({
          recipient: ESCROW_VAULT,
          value: Math.round(amountNIM * 100_000),
          fee: 10,
        });
      }

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
      
      const res = await fetch("/api/escrows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "escrow", payload: e }),
      });

      if (!res.ok) {
        throw new Error("Server failed to record the lock transaction. Your funds may be locked on chain but unrecorded.");
      }

      setEscrows((p) => [e, ...p]);
      setTab("active");
      toast(`Locked ${amountNIM.toLocaleString()} NIM for ${listing.title}`, "success"); setPayoffAmount(amountNIM);
      return e;
    } catch (err) {
      toast(err instanceof Error ? err.message : "Lock failed", "error");
      return null;
    } finally {
      setLocking(false);
    }
  }

  const ensureAuth = useCallback(async (): Promise<boolean> => {
    if (!accounts[0]) return false;
    try {
      // Fast check if already authed (mocking the check by just trying the challenge)
      // Actually, we can just do the auth if any secure request fails, or preemptively
      const res = await fetch("/api/auth/challenge");
      const { nonce } = await res.json();
      const sigRes = await signMessage(nonce);
      
      const toHex = (buf: any) => buf instanceof Uint8Array 
        ? Array.from(buf).map(b => b.toString(16).padStart(2,'0')).join('') 
        : buf;

      const authRes = await fetch("/api/auth/verify", {
         method: "POST", body: JSON.stringify({
            address: accounts[0],
            publicKeyHex: toHex(sigRes.publicKey),
            signatureHex: toHex(sigRes.signature),
            nonce
         })
      });
      return authRes.ok;
    } catch {
      return false;
    }
  }, [accounts, signMessage]);

  async function handleMakeLenderQr(escrow: Escrow) {
    const isAuthed = await ensureAuth();
    if (!isAuthed) {
      toast("Authentication required to generate secure QR", "error");
      return;
    }

    try {
      const res = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escrowId: escrow.id, amount: escrow.amountNIM, chain: "nimiq-testnet" })
      });
      if (!res.ok) throw new Error("Failed to generate QR");
      const { token, publicKeyHex } = await res.json();
      
      setEscrows((p) => p.map((e) => (e.id === escrow.id ? { ...e, lenderPubkey: publicKeyHex } : e)));
      // Also update escrow with the lender's public key
      await fetch("/api/escrows", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: escrow.id, lenderPubkey: publicKeyHex }),
      });
      
      setQrToken({ token, escrow });
    } catch (e) {
      toast("QR generation failed", "error");
    }
  }

  const handleScan = useCallback(
    async (token: string) => {
      const t = token.trim();
      if (!t) return;
      
      const isAuthed = await ensureAuth();
      if (!isAuthed) {
        toast("Authentication required to process QR scan", "error");
        setShowScanner(false);
        return;
      }

      // 1. Handle CreatorVerified manual request (completer shows QR to creator)
      if (t.startsWith("manual_req:")) {
        setShowScanner(false);
        const [_, listingId, completerAddress] = t.split(":");
        if (!listingId || !completerAddress) return toast("Invalid manual request QR", "error");

        const res = await fetch("/api/bounty/manual_approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId, completerAddress }),
        });
        
        if (!res.ok) {
          const data = await res.json();
          return toast(data.error || "Approval failed", "error");
        }
        
        toast(`Approved completion for ${completerAddress.substring(0,8)}...`, "success");
        window.location.reload();
        return;
      }

      // 2. Try Escrows (Borrow Item Returns)
      let matched = false;
      for (const e of escrows) {
        if (e.state !== "locked" || !e.lenderPubkey) continue;
        const payload = await verifyReturn(t, e.lenderPubkey).catch(() => null);
        if (payload && payload.escrowId === e.id) {
          matched = true;
          setShowScanner(false);
          const res = await fetch("/api/escrows", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: e.id, token: t }),
          });
          
          if (!res.ok) {
            const data = await res.json();
            toast(data.error || "Failed to release", "error");
            return;
          }
          
          setEscrows((p) => p.map((x) => (x.id === e.id ? { ...x, state: "released" } : x)));
          toast(`Released ${(e.amountNIM - e.feeNIM).toLocaleString()} NIM (${e.title})`, "success"); setPayoffAmount(-1);
          return;
        }
      }

      // 3. Try ScanQuest (Creator placed QR, Completer scans it)
      if (!matched && t.split('.').length === 2) {
        setShowScanner(false);
        const res = await fetch("/api/bounty/scanquest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: t }),
        });
        
        if (!res.ok) {
          const data = await res.json();
          toast(data.error || "ScanQuest verification failed", "error");
          return;
        }
        
        toast("Quest completed! Reward claimed.", "success"); setPayoffAmount(-1);
        window.location.reload();
        return;
      }

      toast("Invalid QR or no matching locked escrow", "error");
      setShowScanner(false);
    },
    [escrows, ensureAuth]
  );

  async function handleCancel(type: "listing" | "escrow", id: string) {
    if (!confirm("Are you sure you want to cancel this? Funds will be refunded.")) return;
    try {
      const res = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id })
      });
      if (res.ok) {
        toast("Cancelled successfully", "success");
        if (type === "listing") setListings(p => p.filter(l => l.id !== id));
        if (type === "escrow") setEscrows(p => p.map(e => e.id === id ? { ...e, state: "cancelled" } : e));
      } else {
        const err = await res.json();
        toast(err.error || "Failed to cancel", "error");
      }
    } catch (e) {
      toast("Error cancelling", "error");
    }
  }

  async function handleCreateListing(data: any) {
    const isAuthed = await ensureAuth();
    if (!isAuthed) {
      toast("Authentication required to create a listing", "error");
      return;
    }

    let txHash: string | undefined;
    if (data.kind.startsWith("bounty")) {
      try {
        txHash = await sendLock({
          recipient: ESCROW_VAULT,
          value: Math.round(data.collateralNIM * 100_000),
          fee: Math.max(10, MIN_NETWORK_FEE_NIM * 100_000), // network minimum fee
        });
      } catch (err) {
        toast("Failed to fund bounty: " + (err instanceof Error ? err.message : "unknown"), "error");
        return;
      }
    }

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

    try {
      const res = await fetch("/api/escrows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "listing", payload: listing, txHash }),
      });
      if (!res.ok) throw new Error("Failed to save listing");
      
      setListings((p) => [listing, ...p]);
      setShowCreateListing(false);
      toast("Listing deployed to network.", "success");
    } catch (e) {
      console.error(e);
      toast("Failed to deploy listing", "error");
    }
  }

  if (status === "loading") {
    return (
      <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-pulse">
         <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
         </div>
         <h2 className="text-xl font-bold mb-2 text-white">Initializing Protocol</h2>
         <p className="text-slate-400 text-sm">Connecting to Nimiq Pay Engine...</p>
      </div>
    );
  }

  if (status === "error" && !isConnected) {
    return (
      <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
          <LockIcon size={28} className="text-slate-950" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white">Connection Failed</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-[280px]">
          Acta is a native Mini App designed for Nimiq Pay. We couldn't establish a secure connection.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-amber-400 text-slate-950 font-bold py-3 px-8 rounded-full mb-4 w-full max-w-[260px] btn-press shadow-[0_0_15px_rgba(251,191,36,0.4)]"
        >
          Retry Connection
        </button>

        
        <button 
          onClick={() => setIsDemoMode(true)}
          className="mt-4 text-slate-500 text-xs underline decoration-slate-700 hover:text-slate-300 transition-colors"
        >
          Continue in Read-Only Demo Mode
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 bg-slate-950 text-slate-50 flex flex-col font-sans selection:bg-amber-500/30 overflow-hidden">
        <header className="px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 flex justify-between items-center bg-slate-950/90 z-10 backdrop-blur-md shrink-0 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-br from-amber-300 to-amber-600 bg-clip-text text-transparent">Acta</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">
              ACTION ECONOMY {isDemoMode && <span className="bg-rose-500 text-white ml-2 px-1 rounded">READ-ONLY DEMO</span>}
            </p>
          </div>
          <button
            onClick={() => setShowCreateListing(true)}
            className="flex h-10 items-center gap-2 rounded-full bg-white/5 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 btn-press border border-white/10"
          >
            <PlusIcon size={16} /> New
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-6 no-scrollbar">
          
          {tab === "radar" && (
            <div className="pb-10 animate-fade-in">
              {dashboard && <TreasuryCard fees={dashboard.stats.treasury_fees} distributed={dashboard.stats.treasury_distributed} price={dashboard.price} />}
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
                <button onClick={() => setShowMap(!showMap)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 text-xs transition-colors ${showMap ? "bg-sky-500/20 text-sky-400" : "bg-slate-900 text-slate-400 hover:text-white"}`}>
                  <MapPinIcon size={12} /> {showMap ? "List View" : "Map View"}
                </button>
              </div>
              
              {showMap && <div className="pb-6 mb-2"><MapRadar listings={listings.filter(l => l.kind.startsWith("bounty"))} /></div>}
              {!showMap && (
              <div className="flex gap-4 overflow-x-auto pb-6 mb-2 no-scrollbar snap-x">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
                ) : listings.filter(l => l.kind.startsWith("bounty")).length === 0 ? (
                  <EmptyState title="No Bounties" subtitle="No bounties available. Create one!" icon={<ZapIcon size={32} />} />
                ) : (
                  listings.filter(l => l.kind.startsWith("bounty")).map(l => (
                    <div key={l.id} className="min-w-[280px] snap-center card-bounty p-4 rounded-2xl flex flex-col justify-between border border-amber-500/20">
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
                      {l.owner === borrower && l.kind === "bounty_qr" ? (
                        <button
                          onClick={async () => {
                            const res = await fetch("/api/qr/generate", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ type: "scan_quest", escrowId: l.id, amount: l.collateralNIM, chain: "nimiq-testnet" }),
                            });
                            const data = await res.json();
                            if (res.ok) setQrToken({ token: data.token, escrow: { title: l.title, amountNIM: l.collateralNIM } as any });
                            else toast(data.error, "error");
                          }}
                          className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition-all btn-press"
                        >
                          Show Quest QR
                        </button>
                      ) : l.owner === borrower ? (
                        <button disabled className="w-full py-2 bg-slate-800 text-slate-500 font-bold rounded-lg text-xs cursor-not-allowed">
                          Your Bounty
                        </button>
                      ) : (
                        <button
                          onClick={() => setWizard(l)}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all btn-press"
                        >
                          Accept Bounty
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              )}

              <div className="flex items-center justify-between mb-4 mt-4">
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
                    <div key={l.id} className="card-borrow p-3 rounded-xl border border-blue-500/20">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="font-semibold text-sm leading-tight text-white truncate">{l.title}</h4>
                          <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{l.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold tnum text-blue-400 flex items-center justify-end gap-1">
                            <LockIcon size={12} />
                            {l.collateralNIM.toLocaleString()} NIM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg mb-3 border border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">{(l.owner || 'A').charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase">Lender</p>
                            <p className="text-[10px] font-semibold text-white">{l.owner.slice(0, 8)}...</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] text-slate-400 uppercase">Yield</p>
                           <p className="text-[10px] font-bold text-emerald-400 tnum">+{l.yieldNIM || 0.5} NIM</p>
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

              {dashboard?.feed && <ActivityFeed data={dashboard.feed} />}
              {dashboard?.leaderboard && <Leaderboard data={dashboard.leaderboard} />}
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
                  <div key={e.id} className="card p-3 rounded-xl mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-white">{e.title}</h4>
                        <p className="tnum mt-0.5 text-lg font-extrabold text-white">
                          {e.amountNIM.toLocaleString()} <span className="text-xs text-slate-400">NIM</span>
                        </p>
                      </div>
                      <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase ${
                          e.state === "locked" ? "bg-amber-300/15 text-amber-300" : "bg-emerald-400/15 text-emerald-300"
                        }`}>
                        {e.state}
                      </span>
                    </div>

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
                        {e.borrower === accounts[0] && (
                          <button onClick={() => handleCancel("escrow", e.id)} className="mt-2 w-full py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-md text-[10px] uppercase font-bold hover:bg-rose-500/20">Cancel & Refund</button>
                        )}
                        
                        {(() => {
                          const kind = listings.find(l => l.id === e.listingId)?.kind;
                          if (kind === "bounty") {
                            return <BountyVerify task={e.title} listingId={e.listingId} />;
                          } else if (kind === "bounty_venture") {
                            return <VentureVerify listingId={e.listingId} />;
                          } else if (kind === "bounty_manual") {
                            return <ManualVerify listingId={e.listingId} />;
                          } else if (kind === "bounty_qr") {
                            return (
                              <button
                                onClick={() => setShowScanner(true)}
                                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-sky-400/15 px-5 py-3 text-sm font-semibold text-sky-300 transition-all hover:bg-sky-400/25 btn-press"
                              >
                                <ScanIcon size={14} /> Scan ScanQuest QR
                              </button>
                            );
                          }
                          return (
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
                          );
                        })()}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "passport" && (
            <div className="space-y-4 animate-fade-in">
              <div className="card rounded-3xl p-4 text-center border border-white/5">
                <div className="flex justify-center">
                  <TrustRing score={trustScore} size={160} />
                </div>
                <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                  Every contract successfully returned builds your on-chain reputation. Higher trust tiers unlock massive collateral discounts.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
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

              <div className="card rounded-2xl p-4 space-y-4 border border-white/5">
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

              <PassportDetails />

              {escrows.length > 0 && (
                <div className="card rounded-2xl p-4 border border-white/5">
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
          <BorrowWizard price={dashboard?.price} 
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
        {payoffAmount !== null && <SuccessPayoff amount={payoffAmount} onClose={() => setPayoffAmount(null)} />}
      </div>
    </ErrorBoundary>
  );
}
