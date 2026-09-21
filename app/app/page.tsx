"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import BottomTabs, { type Tab } from "@/components/BottomTabs";
import BorrowWizard from "@/components/BorrowWizard";
import BountyVerify from "@/components/BountyVerify";
import { Leaderboard, ActivityFeed } from "@/components/LivenessLayer";
import { TreasuryCard } from "@/components/TreasuryCard";
import { ensureAuthed, apiFetch, installAuthFetchPatch } from "@/lib/auth-client";
import { humanize } from "@/lib/errors";
import { AppHeader, EngravedTabs, trustTier } from "@/components/AppChrome";
import CreatorApprovals from "@/components/CreatorApprovals";
import Inbox, { useUnread } from "@/components/Inbox";
import ReferralSheet from "@/components/ReferralSheet";
import ListingDetailSheet from "@/components/ListingDetailSheet";
import { Countdown } from "@/components/ContractTimeline";
import ProfileSheet from "@/components/ProfileSheet";
import FolioRule from "@/components/FolioRule";
import PassportDashboard from "@/components/PassportDashboard";
import PassportDetails from "@/components/PassportDetails";
import Identicon from "@/components/Identicon";
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
import { InfoTooltip } from "@/components/Tooltip";
import { Coins, Sparkles, QrCode, FileText, ChevronRight, ShieldCheck, Settings, UserCheck, Compass, BookOpen, ExternalLink } from "lucide-react";
import { Seal } from "@/components/Paper";
import { GitHubIcon } from "@/components/docs/SourceLink";
import { formatDistanceToNow } from "date-fns";
import HubApi from "@nimiq/hub-api";
import {
  RadarIcon,
  LockIcon,
  UnlockIcon,
  ScanIcon,
  PlusIcon,
  SearchIcon,
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
  SETTLE_FEE_NIM,
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

function isLiveListing(l: Listing) {
  return l.isActive !== false && (!l.expiresAt || l.expiresAt > Date.now());
}

export default function Home() {
  const { status, accounts, sendLock, signMessage } = useNimiq();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("radar");
  const [showMap, setShowMap] = useState(false);
  const [payoffAmount, setPayoffAmount] = useState<number | null>(null);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [dashboard, setDashboard] = useState<{price: number, stats: any, vault?: any, user?: any, feed?: any[], leaderboard?: any[]} | null>(null);
  const [userTrustScore, setUserTrustScore] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [wizard, setWizard] = useState<Listing | null>(null);
  const [locking, setLocking] = useState(false);
  const [qrToken, setQrToken] = useState<{ token: string; escrow: Escrow } | null>(null);
  const [lenderKeys, setLenderKeys] = useState<Record<string, { pub: string; priv: string }>>({});
  const [showScanner, setShowScanner] = useState(false);
  const [pendingScan, setPendingScan] = useState<string | null>(null);
  const scanFileRef = useRef<HTMLInputElement>(null);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [createKind, setCreateKind] = useState<'borrow' | 'bounty' | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [refOpen, setRefOpen] = useState(false);
  const [reviewListingId, setReviewListingId] = useState<string | null>(null);
  const [justSettled, setJustSettled] = useState(false);
  const [activeSeg, setActiveSeg] = useState<"progress" | "awaiting" | "settled" | "refunded">("progress");
  const [awaitingCount, setAwaitingCount] = useState(0);
  const [seenTabs, setSeenTabs] = useState<Record<string, boolean>>({
    progress: true,
    awaiting: false,
    settled: false,
    refunded: false,
  });
  const [profileAddr, setProfileAddr] = useState<string | null>(null);
  const { unread, refresh: refreshUnread } = useUnread();

  const borrower = accounts[0] ?? "Anonymous";
  const isConnected = status === "connected" || isDemoMode;

  // Real Trust Score (0-100) from the server (stable across refetches)
  const trustScore = userTrustScore ?? dashboard?.user?.trustScore ?? 0;
  const tier = trustTier(trustScore);

  // Sync trust score as soon as account address is known
  useEffect(() => {
    if (!accounts[0]) return;
    apiFetch(`/api/me?address=${encodeURIComponent(accounts[0])}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.trustScore === "number") {
          setUserTrustScore(d.trustScore);
        }
      })
      .catch(() => {});
  }, [accounts]);

  const ensureAuth = useCallback(async (): Promise<boolean> => {
    const addr = accounts[0] || (isDemoMode ? "NQ07 0000 0000 0000 0000 0000 0000 0000" : null);
    if (!addr) return false;
    // Demo mode is a read-only tour: no server session is ever minted for it
    if (isDemoMode && !accounts[0]) return false;
    return ensureAuthed(addr, signMessage);
  }, [accounts, signMessage, isDemoMode]);

  useEffect(() => {
    if (accounts[0] || isDemoMode) {
      ensureAuth().catch(() => {});
    }
  }, [accounts, isDemoMode, ensureAuth]);

  useEffect(() => {
    installAuthFetchPatch();
    try {
      if (typeof localStorage !== "undefined" && !localStorage.getItem("acta.onboarded")) {
        setShowOnboarding(true);
      }
    } catch {}
  }, []);

  const refetch = useCallback(async () => {
    try {
      const q = accounts[0] ? `?address=${encodeURIComponent(accounts[0])}` : "";
      const [eRes, dRes, sRes] = await Promise.all([
        apiFetch("/api/escrows").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        apiFetch(`/api/dashboard${q}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
        apiFetch("/api/bounty/submit").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);
      if (eRes) {
        if (Array.isArray(eRes.escrows)) setEscrows(eRes.escrows);
        if (Array.isArray(eRes.listings)) setListings(eRes.listings);
      }
      if (dRes?.price) {
        setDashboard(dRes);
        if (typeof dRes.user?.trustScore === "number") {
          setUserTrustScore(dRes.user.trustScore);
        }
      }
      if (sRes && Array.isArray(sRes.submissions)) {
        setAwaitingCount(sRes.submissions.length);
      }
      refreshUnread();
    } catch { /* refetch best-effort */ }
  }, [accounts, refreshUnread]);

  // Expiry runs hourly server-side (vercel.json cron) — never from the client.

  // Fetch true Database State
  useEffect(() => {
    let cancelled = false;
    const q = accounts[0] ? `?address=${encodeURIComponent(accounts[0])}` : "";
    
    apiFetch(`/api/dashboard${q}`).then(r => r.json()).then(d => {
      if(!cancelled && d.price) {
        setDashboard(d);
        if (typeof d.user?.trustScore === "number") {
          setUserTrustScore(d.user.trustScore);
        }
      }
    }).catch(() => {});

    apiFetch("/api/bounty/submit")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d && Array.isArray(d.submissions)) {
          setAwaitingCount(d.submissions.length);
        }
      })
      .catch(() => {});

    apiFetch("/api/escrows")
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
  }, [accounts]);

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
      const isRentRequest = listing.kind === "borrow" && listing.borrowMode === "rent";
      
      if (!listing.kind.startsWith("bounty") && !isRentRequest) {
        const shortTitle = listing.title.length > 25 ? listing.title.slice(0, 22) + "..." : listing.title;
        txHash = await sendLock({
          recipient: ESCROW_VAULT,
          value: Math.round(amountNIM * 100_000),
          fee: 10,
          data: `Acta: Escrow "${shortTitle}"`,
        });
      } else if (isRentRequest && listing.txHash) {
        txHash = listing.txHash;
      }

      const e: Escrow = {
        id: newId("esc"),
        listingId: listing.id,
        title: listing.title,
        borrower: isRentRequest ? listing.owner : borrower,
        owner: isRentRequest ? borrower : listing.owner,
        amountNIM: isRentRequest ? listing.collateralNIM : amountNIM,
        feeNIM: MICRO_FEE_NIM,
        yieldNIM: listing.yieldNIM || 0,
        state: "locked",
        txHash,
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * (listing.durationDays || 1),
        description: listing.description,
      };
      
      const idemKey = crypto.randomUUID();
      const res = await apiFetch("/api/escrows", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idemKey },
        body: JSON.stringify({ type: "escrow", payload: e, address: borrower }),
      });

      if (!res.ok) {
        throw new Error("Server failed to record the lock transaction. Your funds may be locked on chain but unrecorded.");
      }

      setEscrows((p) => [e, ...p]);
      setTab("active");
      toast(isRentRequest ? `Accepted rental request for ${listing.title}` : `Locked ${amountNIM.toLocaleString()} NIM for ${listing.title}`, "success"); 
      return e;
    } catch (err) {
      toast(humanize(err), "error");
      return null;
    } finally {
      setLocking(false);
    }
  }

  async function handleMakeLenderQr(escrow: Escrow) {
    const isAuthed = await ensureAuth();
    if (!isAuthed) {
      toast("Authentication required to generate secure QR", "error");
      return;
    }

    try {
      const res = await apiFetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escrowId: escrow.id, amount: escrow.amountNIM, chain: "nimiq-testnet" })
      });
      if (!res.ok) throw new Error("Failed to generate QR");
      const { token, publicKeyHex } = await res.json();
      
      setEscrows((p) => p.map((e) => (e.id === escrow.id ? { ...e, lenderPubkey: publicKeyHex } : e)));
      // Also update escrow with the lender's public key
      await apiFetch("/api/escrows", {
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
        if (!listingId || !completerAddress || completerAddress === "undefined" || !completerAddress.startsWith("NQ")) {
          return toast("Invalid manual request QR", "error");
        }

        const res = await apiFetch("/api/bounty/manual_approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId, completerAddress }),
        });
        
        if (!res.ok) {
          const data = await res.json();
          return toast(data.error || "Approval failed", "error");
        }
        
        toast(`Approved completion for ${completerAddress.substring(0,8)}...`, "success");
        refetch();
        return;
      }

      // 2. Try Escrows (Borrow Item Returns, incl. late returns on expired locks)
      let matched = false;
      let tokenEscrowId: string | null = null;
      try {
        const parts = t.split(".");
        if (parts.length === 2) {
          const b64 = parts[0].replace(/-/g, "+").replace(/_/g, "/");
          const p = JSON.parse(atob(b64));
          if (p && p.escrowId) tokenEscrowId = String(p.escrowId);
        }
      } catch {}

      if (tokenEscrowId) {
        const targetEscrow = escrows.find((x) => x.id === tokenEscrowId);
        if (targetEscrow && (targetEscrow.state === "locked" || (targetEscrow.state as string) === "expired")) {
          matched = true;
          setShowScanner(false);
          const res = await apiFetch("/api/escrows", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: targetEscrow.id, token: t }),
          });

          if (!res.ok) {
            const data = await res.json();
            toast(data.error || "Failed to release", "error");
            return;
          }

          setEscrows((p) => p.map((x) => (x.id === targetEscrow.id ? { ...x, state: "released" } : x)));
          toast(`Released ${(targetEscrow.amountNIM - SETTLE_FEE_NIM).toLocaleString()} NIM (${targetEscrow.title})`, "success"); setPayoffAmount(targetEscrow.amountNIM);
          setJustSettled(true); setTimeout(() => setJustSettled(false), 5000); refetch(); refreshUnread();
          return;
        }
      }

      for (const e of escrows) {
        if ((e.state !== "locked" && (e.state as string) !== "expired") || !e.lenderPubkey) continue;
        const payload = await verifyReturn(t, e.lenderPubkey).catch(() => null);
        if (payload && payload.escrowId === e.id) {
          matched = true;
          setShowScanner(false);
          const res = await apiFetch("/api/escrows", {
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
          toast(`Released ${(e.amountNIM - SETTLE_FEE_NIM).toLocaleString()} NIM (${e.title})`, "success"); setPayoffAmount(e.amountNIM);
          setJustSettled(true); setTimeout(() => setJustSettled(false), 5000); refetch(); refreshUnread();
          return;
        }
      }

      // 3. Try ScanQuest (Creator placed QR, Completer scans it)
      if (!matched && t.split('.').length === 2) {
        setShowScanner(false);
        const res = await apiFetch("/api/bounty/scanquest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: t }),
        });

        if (res.status === 422) {
          // Sponsor demands proof of presence: take a scene photo, then resubmit.
          const data = await res.json();
          setPendingScan(t);
          toast(data.error || "Scene photo required", "info");
          setTimeout(() => scanFileRef.current?.click(), 350);
          return;
        }
        if (!res.ok) {
          const data = await res.json();
          toast(data.error || "ScanQuest verification failed", "error");
          return;
        }

        toast("Quest completed! Reward claimed.", "success"); setPayoffAmount(-1);
        setJustSettled(true); setTimeout(() => setJustSettled(false), 5000); refetch(); refreshUnread();
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
      const res = await apiFetch("/api/cancel", {
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
    const isBorrowRent = data.kind === "borrow" && data.borrowMode === "rent";
    if (data.kind.startsWith("bounty") || isBorrowRent) {
      try {
        const shortTitle = data.title.length > 25 ? data.title.slice(0, 22) + "..." : data.title;
        const memo = isBorrowRent ? `Acta: Rent Request "${shortTitle}"` : `Acta: Bounty "${shortTitle}"`;
        txHash = await sendLock({
          recipient: ESCROW_VAULT,
          value: Math.round(data.collateralNIM * 100_000),
          fee: Math.max(10, MIN_NETWORK_FEE_NIM * 100_000), // network minimum fee
          data: memo,
        });
      } catch (err) {
        toast(humanize((isBorrowRent ? "Failed to fund rental request: " : "Failed to fund bounty: ") + (err instanceof Error ? err.message : "unknown")), "error");
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
      isActive: true,
      ...(data.borrowMode ? { borrowMode: data.borrowMode } : {}),
      ...(txHash ? { txHash } : {}),
      ...(data.contract ? { contract: data.contract } : {}),
      ...(data.expiresAt ? { expiresAt: data.expiresAt } : {}),
      ...(typeof data.requireLocation === "boolean" ? { requireLocation: data.requireLocation } : {}),
    };

    try {
      const listingKey = crypto.randomUUID();
      const res = await apiFetch("/api/escrows", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": listingKey },
        body: JSON.stringify({ type: "listing", payload: listing, txHash, address: borrower }),
      });
      if (!res.ok) throw new Error("Failed to save listing");
      
      setListings((p) => [listing, ...p]);
      setShowCreateListing(false);
      toast("Listing deployed to network.", "success");
    } catch (e) {
      console.error(e);
      toast(humanize("Failed to deploy listing — database unreachable"), "error");
    }
  }

  if (status === "loading") {
    return (
      <div className="app-ink absolute inset-0 z-50 bg-[var(--bg)] flex flex-col items-center justify-center p-4 text-center animate-pulse">
         <div className="w-16 h-16 bg-gradient-to-br from-[var(--gold2)]/20 to-[var(--gold)]/20 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
         </div>
         <h2 className="text-xl font-bold mb-2 text-[var(--ink)]">Initializing Protocol</h2>
         <p className="text-[var(--ink3)] text-sm">Connecting to Nimiq Pay Engine...</p>
      </div>
    );
  }

  if (status === "error" && !isConnected) {
    return (
      <div className="app-ink absolute inset-0 z-50 bg-[var(--bg)] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[var(--gold2)] to-[var(--gold)] rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(154,116,24,0.3)]">
          <LockIcon size={28} className="text-[#1c1508]" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--ink)]">Connection Failed</h2>
        <div className="text-[var(--ink3)] text-sm mb-6 leading-relaxed max-w-[300px] flex flex-col gap-3">
          <p>Acta is a native Mini App designed for Nimiq Pay. We couldn't establish a secure connection.</p>
          <p className="text-[var(--gold)]/90 font-medium">Please ensure you are opening this app from within a supported Nimiq wallet environment.</p>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          className="bg-[var(--gold)] text-[#1c1508] font-bold py-3 px-8 rounded-full mb-3 w-full max-w-[260px] btn-press shadow-[0_0_15px_rgba(154,116,24,0.4)]"
        >
          Retry Connection
        </button>

        <a 
          href="https://nimiq.com/wallet/" 
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[var(--surface2)] text-[var(--ink)] font-semibold py-3 px-8 rounded-full mb-6 w-full max-w-[260px] border border-[var(--line)] hover:bg-[var(--surface2)] transition-colors flex items-center justify-center gap-2 btn-press"
        >
          Get Nimiq Wallet
        </a>
        
        <button 
          onClick={() => setIsDemoMode(true)}
          className="mt-2 text-[var(--ink3)] text-xs underline decoration-[var(--line)] hover:text-[var(--ink2)] transition-colors"
        >
          Continue in Read-Only Demo Mode
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 bg-[var(--bg)] text-[var(--ink)] flex flex-col font-sans selection:bg-[var(--gold)]/30 overflow-hidden">
        <AppHeader
          trustScore={trustScore}
          connected={status === "connected" || isDemoMode}
          onCreate={() => {
            setCreateKind(null);
            setShowCreateListing(true);
          }}
          onOpenInbox={() => setInboxOpen(true)}
          unread={unread}
        />
        {isDemoMode && (
          <p className="bg-[var(--wax)] px-4 py-1 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--ink)]">
            Read-only demo — locks disabled
          </p>
        )}

        <main className={status !== "connected" && !isDemoMode ? "dimmed flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-8 no-scrollbar" : "flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-8 no-scrollbar"}>
          
          {tab === "radar" && (
            <div className="pb-10 animate-fade-in">
              <div className="px-4 pt-4">
                <div className="flex items-center gap-1.5 text-center">
                  {[["1 · Lock", "Funds move to the vault"], ["2 · Prove", "Oracle checks reality"], ["3 · Paid", "Vault releases + receipt"]].map(([s, d]) => (
                    <div key={s} className="flex-1 border-t border-[var(--line)] pt-2">
                      <p className="caps text-[7.5px] text-[var(--gold)]">{s}</p>
                      <p className="marginalia mt-0.5 text-[10px] leading-tight">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
              {dashboard && <><TreasuryCard fees={dashboard.stats.treasury_fees} distributed={dashboard.stats.treasury_distributed} price={dashboard.price} balance={dashboard.vault?.balance_nim ?? null} vaultAddress={dashboard.vault?.address} tvl={dashboard.stats.tvl_nim} volume={dashboard.stats.volume_30d} /><FolioRule /></>}
              

              {/* BOUNTY CONTAINER (Spanning full width across the edges of the screen with subtle border designs, custom background, and capped max height) */}
              <section className="-mx-4 parchment-bounty-section px-4 py-4 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--gold)] flex items-center gap-2">
                      <ZapIcon size={15} className="text-[var(--gold)]" /> Earn NIM (Bounties)
                    </h3>
                    <InfoTooltip
                      title="How Protocol Bounties Work"
                      content="Patrons lock full NIM rewards into the protocol vault upfront. Performers complete real-world deeds and submit verifiable proof (AI vision inspection, GPS check-in, or ScanQuest tokens). Upon verification, locked funds release directly to your wallet."
                    />
                  </div>
                  <button onClick={() => setShowMap(!showMap)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--line)]/10 text-xs transition-colors ${showMap ? "bg-[var(--gold)]/20 text-[var(--gold)]" : "bg-[var(--surface)] text-[var(--ink3)] hover:text-[var(--ink)]"}`}>
                    <MapPinIcon size={12} /> {showMap ? "List View" : "Map View"}
                  </button>
                </div>
                <p className="text-xs text-[var(--ink3)] leading-relaxed mb-3">
                  Complete real-world tasks and verified deeds to earn instant NIM rewards funded upfront by patrons.
                </p>
                
                {/* Subtle pulsing/bouncy/growing-shrinking button that skips step 1 and opens bounty creation */}
                <button
                  onClick={() => {
                    setCreateKind('bounty');
                    setShowCreateListing(true);
                  }}
                  className="w-full mb-4 py-3 px-4 rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20 text-[var(--gold)] flex items-center justify-center gap-2.5 transition-all group btn-press animate-breathe-gold shadow-[0_2px_12px_rgba(212,175,55,0.15)]"
                >
                  <div className="w-5 h-5 rounded-full bg-[var(--gold)]/20 flex items-center justify-center group-hover:scale-125 group-hover:rotate-90 transition-transform">
                     <PlusIcon size={13} className="text-[var(--gold)] stroke-[3]" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink)]">Deploy Protocol Bounty</span>
                </button>

                {showMap && <div className="pb-4 mb-2"><MapRadar listings={listings.filter(l => isLiveListing(l) && l.kind.startsWith("bounty"))} /></div>}
                {!showMap && (
                  loading ? (
                    <div className="space-y-3 pr-1">
                      {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                  ) : listings.filter(l => isLiveListing(l) && l.kind.startsWith("bounty")).length === 0 ? (
                    <div className="py-2">
                      <EmptyState title="No Bounties" subtitle="No bounties available. Create one!" icon={<ZapIcon size={32} />} />
                    </div>
                  ) : (
                    <div className="max-h-[440px] overflow-y-auto custom-parchment-scrollbar pr-1 space-y-3">
                      {listings.filter(l => isLiveListing(l) && l.kind.startsWith("bounty")).map(l => (
                      <div key={l.id} className="group relative rounded-2xl border border-[var(--gold)]/35 bg-gradient-to-b from-[var(--surface)] via-[var(--surface)] to-[color-mix(in_srgb,var(--surface)_90%,var(--gold2)_10%)] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[var(--gold)]/60 hover:shadow-[0_6px_20px_rgba(212,175,55,0.12)] transition-all overflow-hidden">
                        {/* Background Watermark Fleuron */}
                        <div className="absolute -bottom-5 -right-4 text-6xl font-serif text-[var(--gold)]/5 pointer-events-none select-none" aria-hidden="true">
                          ❦
                        </div>

                        {/* Top Header: Oracle Heraldic Badge & Bounty Purse */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {l.owner === accounts[0] ? (
                              <span className="caps text-[8.5px] font-extrabold tracking-wider text-[var(--gold)] bg-[var(--gold)]/15 px-2 py-0.5 rounded-full border border-[var(--gold)]/30">
                                Your Bounty
                              </span>
                            ) : escrows.some(e => e.listingId === l.id && e.borrower === accounts[0] && (e.state === "locked" || (e as any).state === "settling")) ? (
                              <span className="caps text-[8.5px] font-extrabold tracking-wider text-[var(--sky)] bg-[var(--sky)]/15 px-2 py-0.5 rounded-full border border-[var(--sky)]/30">
                                In Progress · Accepted
                              </span>
                            ) : null}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-[var(--gold)]">
                              {l.kind === "bounty_geo" ? (
                                <><MapPinIcon size={11} className="text-[var(--gold)]" /><span className="caps text-[8.5px] font-bold tracking-wider">GPS Check-In</span></>
                              ) : l.kind === "bounty_qr" ? (
                                <><QrCode size={11} className="text-[var(--gold)]" /><span className="caps text-[8.5px] font-bold tracking-wider">ScanQuest Token</span></>
                              ) : l.kind === "bounty_manual" ? (
                                <><UserCheck size={11} className="text-[var(--gold)]" /><span className="caps text-[8.5px] font-bold tracking-wider">In-Person Verification</span></>
                              ) : l.kind === "bounty_venture" ? (
                                <><Compass size={11} className="text-[var(--gold)]" /><span className="caps text-[8.5px] font-bold tracking-wider">Online Venture</span></>
                              ) : l.kind === "bounty" || (l as any).contract?.ai?.primary === "vision" ? (
                                <><Sparkles size={11} className="text-[var(--gold)]" /><span className="caps text-[8.5px] font-bold tracking-wider">Vision Oracle</span></>
                              ) : (
                                <><ZapIcon size={11} className="text-[var(--gold)]" /><span className="caps text-[8.5px] font-bold tracking-wider">{categoryBadge(l)}</span></>
                              )}
                            </div>
                            {Boolean(l.requireLocation || (l as any).targetLat != null) && (
                              <span className="caps text-[8px] font-bold tracking-wider text-[var(--sky)] bg-[var(--sky)]/10 px-2 py-0.5 rounded-full border border-[var(--sky)]/25">
                                📍 GPS Required
                              </span>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-[var(--gold)]/15 to-[var(--gold)]/25 border border-[var(--gold)]/40 shadow-sm">
                              <Coins size={12} className="text-[var(--gold)]" />
                              <span className="font-mono text-sm font-black text-[var(--gold)] tnum">{l.collateralNIM.toLocaleString()} NIM</span>
                            </div>
                            {dashboard && <p className="text-[9px] text-[var(--ink3)] mt-0.5 marginalia">≈ ${(l.collateralNIM * dashboard.price).toFixed(2)} USD</p>}
                          </div>
                        </div>

                        {/* Title & Patron attribution */}
                        <h4 className="font-serif text-base font-bold text-[var(--ink)] leading-snug mb-1 group-hover:text-[var(--gold)] transition-colors">
                          {l.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px] text-[var(--ink3)]">
                          <span className="marginalia">patron:</span>
                          <button onClick={() => setProfileAddr(l.owner)} className="font-mono text-[10px] text-[var(--sky)] hover:underline font-semibold">{l.owner.slice(0, 11)}…</button>
                          {(l as any).createdAt ? (
                            <span className="text-[9px] text-[var(--ink3)]/80">· listed {formatDistanceToNow(new Date(Number((l as any).createdAt)), { addSuffix: true })}</span>
                          ) : null}
                          {(l as any).expiresAt ? (
                            <span className="text-[9px] font-semibold text-[var(--gold)]/90">· ⏱ {timeRemaining((l as any).expiresAt)}</span>
                          ) : null}
                        </div>

                        <p className="text-xs leading-relaxed text-[var(--ink2)] mb-3 line-clamp-2">{l.description}</p>

                        {(l as any).contract?.criteria && (
                          <div className="mb-3 px-3 py-1.5 rounded-xl bg-[color-mix(in_srgb,var(--ink)_4%,transparent)] border-l-2 border-[var(--gold)] text-[10.5px] text-[var(--ink3)]">
                            <span className="font-bold text-[var(--gold)] uppercase text-[8px] tracking-wider block">Writ Criteria:</span>
                            <p className="italic text-[var(--ink2)] text-[10.5px]">"{(l as any).contract.criteria}"</p>
                          </div>
                        )}

                        {/* Action button */}
                        {(() => {
                          const isMyBounty = l.owner === accounts[0];
                          const myActiveEscrow = escrows.find(e => e.listingId === l.id && e.borrower === accounts[0] && (e.state === "locked" || (e as any).state === "settling"));

                          if (isMyBounty && l.kind === "bounty_qr") {
                            return (
                              <button
                                onClick={async () => {
                                  const res = await apiFetch("/api/qr/generate", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ type: "scan_quest", escrowId: l.id, amount: l.collateralNIM, chain: "nimiq-testnet" }),
                                  });
                                  const data = await res.json();
                                  if (res.ok) setQrToken({ token: data.token, escrow: { title: l.title, amountNIM: l.collateralNIM } as any });
                                  else toast(data.error, "error");
                                }}
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-[var(--sky)] to-[var(--sky)]/80 text-[#181206] font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all btn-press"
                              >
                                <QrCode size={13} />
                                <span>Show Quest QR</span>
                              </button>
                            );
                          }

                          if (isMyBounty) {
                            return (
                              <button
                                onClick={() => setReviewListingId(l.id)}
                                className="w-full py-2.5 px-4 bg-[var(--surface2)] hover:bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all btn-press"
                              >
                                <Settings size={13} />
                                <span>Manage Your Bounty</span>
                              </button>
                            );
                          }

                          if (myActiveEscrow) {
                            return (
                              <button
                                onClick={() => { setTab("active"); setActiveSeg("progress"); }}
                                className="w-full py-2.5 px-4 bg-[var(--sky)]/15 hover:bg-[var(--sky)]/25 text-[var(--sky)] border border-[var(--sky)]/35 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all btn-press"
                              >
                                <span>In Progress — View in Contracts</span>
                                <ChevronRight size={13} strokeWidth={3} />
                              </button>
                            );
                          }

                          return (
                            <button
                              onClick={() => setReviewListingId(l.id)}
                              disabled={isDemoMode}
                              className="w-full py-2.5 px-4 bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] hover:from-[var(--gold2)] hover:to-[var(--gold)] text-[#181206] font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(212,175,55,0.25)] border border-[var(--gold)] active:scale-[0.98] transition-all btn-press disabled:opacity-50"
                            >
                              <span>Accept Bounty Challenge</span>
                              <ChevronRight size={13} strokeWidth={3} />
                            </button>
                          );
                        })()}
                      </div>
                    ))}
                    </div>
                  )
                )}
              </section>

              {/* Exact FolioRule Divider Circled in Screenshot */}
              <FolioRule />

              {/* BORROW CONTAINER (Spanning full width across the edges of the screen with subtle border designs, custom background, and capped max height) */}
              <section className="-mx-4 parchment-borrow-section px-4 py-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--sky)] flex items-center gap-2">
                      <MapPinIcon size={15} className="text-[var(--sky)]" /> Available Nearby (Borrow)
                    </h3>
                    <InfoTooltip
                      title="How Borrowing Works"
                      content="Borrowers lock the item's collateral value into the Nimiq smart escrow. The lender hands over the item for the agreed duration. Upon return inspection, scanning the generated QR covenant automatically unlocks and refunds your collateral back to your wallet."
                    />
                  </div>
                </div>
                <p className="text-xs text-[var(--ink3)] leading-relaxed mb-3">
                  Borrow tools, physical goods, and community hardware securely backed by 100% refundable on-chain NIM collateral.
                </p>
                
                {/* Subtle pulsing/bouncy/growing-shrinking button that skips step 1 and opens borrow creation */}
                <button
                  onClick={() => {
                    setCreateKind('borrow');
                    setShowCreateListing(true);
                  }}
                  className="w-full mb-4 py-3 px-4 rounded-xl border border-[var(--sky)]/40 bg-[var(--sky)]/10 hover:bg-[var(--sky)]/20 text-[var(--sky)] flex items-center justify-center gap-2.5 transition-all group btn-press animate-breathe-sky shadow-[0_2px_12px_rgba(56,189,248,0.15)]"
                >
                  <div className="w-5 h-5 rounded-full bg-[var(--sky)]/20 flex items-center justify-center group-hover:scale-125 group-hover:rotate-90 transition-transform">
                     <PlusIcon size={13} className="text-[var(--sky)] stroke-[3]" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink)]">List or Request Equipment</span>
                </button>

                {loading ? (
                  <div className="space-y-3 pr-1">
                    {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : listings.filter(l => isLiveListing(l) && l.kind === "borrow").length === 0 ? (
                  <div className="py-2">
                    <EmptyState title="No Items" subtitle="No items available to borrow or rent." icon={<MapPinIcon size={32} />} />
                  </div>
                ) : (
                  <div className="max-h-[440px] overflow-y-auto custom-parchment-scrollbar pr-1 space-y-3">
                    {listings.filter(l => isLiveListing(l) && l.kind === "borrow").map((l) => {
                      const isRentRequest = l.borrowMode === "rent";
                      const isOwner = l.owner === accounts[0];
                      const myActiveBorrow = escrows.find(e => e.listingId === l.id && e.borrower === accounts[0] && (e.state === "locked" || (e as any).state === "settling"));

                      return (
                        <div key={l.id} className="group relative rounded-2xl border border-[var(--sky)]/35 bg-gradient-to-b from-[var(--surface)] via-[var(--surface)] to-[color-mix(in_srgb,var(--surface)_90%,var(--sky)_10%)] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[var(--sky)]/60 hover:shadow-[0_6px_20px_rgba(56,189,248,0.12)] transition-all overflow-hidden">
                          {/* Background Watermark */}
                          <div className="absolute -bottom-5 -right-4 text-6xl font-serif text-[var(--sky)]/5 pointer-events-none select-none" aria-hidden="true">
                            ⚑
                          </div>

                          {/* Top Header: Category Chip & Locked Collateral Purse */}
                          <div className="flex items-start justify-between gap-3 mb-2.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isOwner ? (
                                <span className="caps text-[8.5px] font-extrabold tracking-wider text-[var(--sky)] bg-[var(--sky)]/15 px-2 py-0.5 rounded-full border border-[var(--sky)]/30">
                                  {isRentRequest ? "Your Rental Request" : "Your Lending Offer"}
                                </span>
                              ) : myActiveBorrow ? (
                                <span className="caps text-[8.5px] font-extrabold tracking-wider text-[var(--sky)] bg-[var(--sky)]/15 px-2 py-0.5 rounded-full border border-[var(--sky)]/30">
                                  In Progress · Accepted
                                </span>
                              ) : (
                                <span className="caps text-[8.5px] font-bold tracking-wider text-[var(--sky)] bg-[var(--sky)]/10 px-2 py-0.5 rounded-full border border-[var(--sky)]/25">
                                  {isRentRequest ? "Rental Request" : "Available to Lend"}
                                </span>
                              )}
                              <span className="caps text-[8.5px] font-bold tracking-wider text-[var(--sky)] bg-[var(--sky)]/10 px-2.5 py-1 rounded-full border border-[var(--sky)]/25">
                                {l.category.toUpperCase()} · {l.durationDays || 1}D RETURN COVENANT
                              </span>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--sky)]/15 border border-[var(--sky)]/40 shadow-sm">
                                <LockIcon size={11} className="text-[var(--sky)]" />
                                <span className="font-mono text-xs font-bold text-[var(--sky)] tnum">{l.collateralNIM.toLocaleString()} NIM</span>
                              </div>
                              <p className="text-[8px] uppercase tracking-wider text-[var(--ink3)] mt-0.5">
                                {isRentRequest ? "Vault Collateral" : "Required Collateral"}
                              </p>
                            </div>
                          </div>

                          {/* Title & Description */}
                          <h4 className="font-serif text-base font-bold text-[var(--ink)] leading-snug mb-1 group-hover:text-[var(--sky)] transition-colors">
                            {l.title}
                          </h4>

                          <div className="flex items-center gap-2 mb-2 text-[10px] text-[var(--ink3)]">
                            <span className="marginalia">{isRentRequest ? "requester:" : "lender:"}</span>
                            <button onClick={() => setProfileAddr(l.owner)} className="font-mono text-[10px] text-[var(--sky)] hover:underline font-semibold">{l.owner.slice(0, 11)}…</button>
                            {(l as any).createdAt ? (
                              <span className="text-[9px] text-[var(--ink3)]/80">· listed {formatDistanceToNow(new Date(Number((l as any).createdAt)), { addSuffix: true })}</span>
                            ) : null}
                          </div>

                          <p className="text-xs leading-relaxed text-[var(--ink2)] mb-3 line-clamp-2">{l.description}</p>

                          {/* Notarial Covenant Terms Grid (3 Columns) */}
                          <div className="mb-3 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] border border-[var(--line)]/15 divide-x divide-[var(--line)]/10 text-center">
                            <div className="pr-1">
                              <p className="caps text-[7.5px] text-[var(--ink3)]">{isRentRequest ? "Requester" : "Lender"}</p>
                              <button onClick={() => setProfileAddr(l.owner)} className="font-mono text-[10px] font-semibold text-[var(--sky)] hover:underline truncate max-w-full block mx-auto mt-0.5">
                                {l.owner.slice(0, 8)}…
                              </button>
                            </div>
                            <div className="px-1">
                              <p className="caps text-[7.5px] text-[var(--ink3)]">Duration</p>
                              <p className="font-mono text-[10px] font-semibold text-[var(--ink)] mt-0.5">{l.durationDays || 1} Days</p>
                            </div>
                            <div className="pl-1">
                              <p className="caps text-[7.5px] text-[var(--ink3)]">Yield</p>
                              <p className="font-mono text-[10px] font-bold text-[var(--verdigris)] tnum mt-0.5">+{l.yieldNIM || 0} NIM</p>
                            </div>
                          </div>

                          {/* Action button */}
                          {(() => {
                            if (isOwner) {
                              return (
                                <button
                                  onClick={() => setReviewListingId(l.id)}
                                  className="w-full py-2.5 px-4 bg-[var(--surface2)] hover:bg-[var(--sky)]/10 text-[var(--sky)] border border-[var(--sky)]/30 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all btn-press"
                                >
                                  <Settings size={13} />
                                  <span>{isRentRequest ? "Manage Rental Request" : "Manage Lending Offer"}</span>
                                </button>
                              );
                            }

                            if (myActiveBorrow) {
                              return (
                                <button
                                  onClick={() => { setTab("active"); setActiveSeg("progress"); }}
                                  className="w-full py-2.5 px-4 bg-[var(--sky)]/15 hover:bg-[var(--sky)]/25 text-[var(--sky)] border border-[var(--sky)]/35 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all btn-press"
                                >
                                  <span>Active Covenant — View in Contracts</span>
                                  <ChevronRight size={13} strokeWidth={3} />
                                </button>
                              );
                            }

                            return (
                              <button
                                onClick={() => setReviewListingId(l.id)}
                                disabled={isDemoMode}
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-[var(--sky)] to-[color-mix(in_srgb,var(--sky)_80%,#1e3a8a)] hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(56,189,248,0.25)] border border-[var(--sky)]/50 active:scale-[0.98] transition-all btn-press disabled:opacity-50"
                              >
                                <FileText size={12} />
                                <span>{isRentRequest ? "Review & Fulfill Rental" : "Review & Borrow Asset"}</span>
                                <ChevronRight size={12} strokeWidth={3} />
                              </button>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Exact FolioRule Divider Circled in Screenshot */}
              <FolioRule />

              {/* HORIZONTAL SCROLLING BOTTOM CARDS (Global Activity & Trust Leaderboard in swiping carousel) */}
              <div className="relative -mx-4 mb-6">
                <div className="flex items-center justify-between px-4 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink3)] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--verdigris)] animate-pulse" />
                      Public Registers & Deeds
                    </span>
                    <InfoTooltip
                      title="On-Chain Settlement Ledgers"
                      content="Immutable public logs of peer-to-peer acts, escrow releases, and community standing recorded directly on the Nimiq network."
                    />
                  </div>
                  <span className="marginalia text-[10px] text-[var(--ink3)]">Swipe cards ↔</span>
                </div>
                <p className="px-4 text-[10.5px] text-[var(--ink3)] mb-2.5">
                  An immutable public ledger of live settlements, peer-to-peer acts, and verified protocol citizens on Nimiq.
                </p>
                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar px-4">
                  <div className="w-[88vw] max-w-[440px] shrink-0 snap-center">
                    <ActivityFeed data={dashboard?.feed ?? []} onView={setProfileAddr} />
                  </div>
                  <div className="w-[88vw] max-w-[440px] shrink-0 snap-center">
                    <Leaderboard data={dashboard?.leaderboard ?? []} onView={setProfileAddr} />
                  </div>
                </div>
              </div>

              {/* Radar Protocol Colophon */}
              <div className="mt-10 pt-8 pb-14 px-4 border-t border-[var(--line)]/50 text-center space-y-3.5">
                <div className="flex items-center justify-center gap-2">
                  <a href="/" title="Acta Protocol Home">
                    <Seal size={28} className="!text-[10px]">A</Seal>
                  </a>
                  <span className="caps font-display text-xs font-bold tracking-[0.2em] text-[var(--ink)]">
                    Acta Protocol
                  </span>
                </div>

                <p className="marginalia text-[11px] text-[var(--ink3)] max-w-sm mx-auto leading-relaxed">
                  Autonomous Proof-of-Action engine anchored to Nimiq PoS Albatross sub-second micro-blocks.
                </p>

                {/* Curated High-Signal Links */}
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-mono text-[var(--ink3)]">
                  <a
                    href="/docs"
                    className="inline-flex items-center gap-1.5 hover:text-[var(--gold)] transition-colors"
                  >
                    <BookOpen size={12} className="text-[var(--gold)]" />
                    <span>Documentation</span>
                  </a>

                  <span className="text-[var(--line-strong)] opacity-60">·</span>

                  <a
                    href="https://github.com/Idle0x/nimiq-acta"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[var(--gold)] transition-colors"
                  >
                    <GitHubIcon size={12} className="text-[var(--gold)]" />
                    <span>Source Code</span>
                  </a>

                  <span className="text-[var(--line-strong)] opacity-60">·</span>

                  <a
                    href="https://nimiq.watch"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[var(--verdigris)] transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--verdigris)] animate-pulse" />
                    <span>Nimiq Network</span>
                    <ExternalLink size={10} className="opacity-60" />
                  </a>

                  <span className="text-[var(--line-strong)] opacity-60">·</span>

                  <a
                    href="/#doctrine"
                    className="inline-flex items-center gap-1 hover:text-[var(--gold)] transition-colors"
                  >
                    <span>Doctrine</span>
                  </a>
                </div>

                <div className="pt-1 text-[10px] font-mono text-[var(--ink3)]/80 space-y-0.5">
                  <div className="truncate max-w-xs mx-auto">
                    Vault: <span className="text-[var(--gold)] select-all">{ESCROW_VAULT}</span>
                  </div>
                  <div>
                    Protocol fee: 0.001 NIM · Gas: 0.0001 NIM · Zero-Cron
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "active" && (

            <div className="px-4 pb-10 animate-fade-in">
              {(() => {
                const progressCount = escrows.filter((e) => e.state === "locked" || (e as any).state === "settling").length;
                const manualAwaitingCount = escrows.filter((e) => {
                  const l = listings.find((x) => x.id === e.listingId);
                  return l?.owner === accounts[0] && l?.kind === "bounty_manual" && e.state === "locked";
                }).length;
                const totalAwaitingCount = awaitingCount + manualAwaitingCount;
                const settledCount = escrows.filter((e) => e.state === "released").length;
                const refundedCount = escrows.filter((e) => e.state === "cancelled" || (e as any).state === "expired" || (e as any).state === "refunded").length;

                const segs = [
                  { id: "progress" as const, label: "In progress", count: progressCount },
                  { id: "awaiting" as const, label: "Awaiting me", count: totalAwaitingCount },
                  { id: "settled" as const, label: "Settled", count: settledCount },
                  { id: "refunded" as const, label: "Refunded", count: refundedCount },
                ];

                return (
                  <div className="mb-3 flex gap-1 border-y border-[var(--line)] px-1 py-1.5">
                    {segs.map((seg) => {
                      const isSelected = activeSeg === seg.id;
                      const showBadge = seg.count > 0 && !seenTabs[seg.id] && !isSelected;
                      return (
                        <button
                          key={seg.id}
                          onClick={() => {
                            setActiveSeg(seg.id);
                            setSeenTabs((p) => ({ ...p, [seg.id]: true }));
                          }}
                          className="caps relative flex-1 rounded-full py-2 text-[8px] transition-all flex items-center justify-center gap-1"
                          style={isSelected ? { background: "var(--gold)", color: "#1c1508", fontWeight: 700 } : { color: "var(--ink3)" }}
                        >
                          <span>{seg.label}</span>
                          {showBadge ? (
                            <span className="figure rounded-full bg-[var(--gold)] px-1.5 py-0.2 text-[8px] font-bold text-[#1c1508] shadow-sm animate-pulse">
                              {seg.count}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Clear 1-line explanation for each mini-tab in Contracts */}
              <div className="mb-4 px-3 py-2 rounded-xl bg-[color-mix(in_srgb,var(--ink)_3%,transparent)] border border-[var(--line)]/10 text-center">
                <p className="text-[11px] text-[var(--ink2)] leading-relaxed">
                  {activeSeg === "progress" && "Active covenants currently locked in escrow awaiting on-chain verification or return proof."}
                  {activeSeg === "awaiting" && "Submissions and claims awaiting your direct approval or sign-off as listing creator."}
                  {activeSeg === "settled" && "Successfully fulfilled covenants with rewards or released collateral paid out on-chain."}
                  {activeSeg === "refunded" && "Cancelled or expired escrows where collateral has been returned in full to the depositor."}
                </p>
              </div>

              {activeSeg === "awaiting" ? (
                <div className="space-y-4">
                  <CreatorApprovals onApproved={refetch} onCount={setAwaitingCount} showEmpty={false} onView={setProfileAddr} />
                  {(() => {
                    const manualAwaiting = escrows.filter((e) => {
                      const l = listings.find((x) => x.id === e.listingId);
                      return l?.owner === accounts[0] && l?.kind === "bounty_manual" && e.state === "locked";
                    });
                    if (manualAwaiting.length > 0) {
                      return (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] flex items-center gap-1.5">
                            <UserCheck size={14} /> In-Person Approvals Awaiting Scan ({manualAwaiting.length})
                          </h4>
                          {manualAwaiting.map((e) => (
                            <div key={e.id} className="ledger-entry">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="rounded-md px-1.5 py-0.5 text-[8.5px] font-extrabold tracking-widest uppercase bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--gold)]/30">
                                    SPONSOR SCAN REQUIRED
                                  </span>
                                  <h4 className="font-bold text-sm text-[var(--ink)] mt-1">{e.title}</h4>
                                  <p className="tnum text-base font-extrabold text-[var(--ink)]">
                                    {e.amountNIM.toLocaleString()} <span className="text-xs text-[var(--ink3)]">NIM</span>
                                  </p>
                                </div>
                              </div>
                              <ManualVerify
                                listingId={e.listingId}
                                isOwner={true}
                                onScan={() => setShowScanner(true)}
                              />
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })()}
                  {awaitingCount === 0 && escrows.filter(e => {
                    const l = listings.find(x => x.id === e.listingId);
                    return l?.owner === accounts[0] && l?.kind === "bounty_manual" && e.state === "locked";
                  }).length === 0 && (
                    <div className="py-10 text-center">
                      <div className="mx-auto w-12 h-12 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)] mb-3">
                        <CheckIcon size={24} />
                      </div>
                      <h4 className="font-bold text-sm text-[var(--ink)]">All Clear</h4>
                      <p className="marginalia text-xs text-[var(--ink3)] mt-1 max-w-xs mx-auto">
                        No submissions or verification requests currently awaiting your approval. Active covenants live in In progress.
                      </p>
                    </div>
                  )}
                </div>
              ) : loading ? (
                Array.from({ length: 2 }).map((_, i) => <SkeletonEscrow key={i} />)
              ) : (() => {
                const filteredEscrows = escrows.filter((e) =>
                  activeSeg === "progress" ? (e.state === "locked" || (e as any).state === "settling") :
                  activeSeg === "settled" ? e.state === "released" :
                  (e.state === "cancelled" || (e as any).state === "expired" || (e as any).state === "refunded")
                );

                if (filteredEscrows.length === 0) {
                  if (activeSeg === "progress") {
                    return (
                      <EmptyState
                        title="No Contracts in Progress"
                        subtitle="No active covenants locked right now. Accept a bounty or borrow an item on Radar!"
                        icon={<CheckIcon size={32} />}
                        action={{ label: "Browse Radar", onClick: () => setTab("radar") }}
                      />
                    );
                  }
                  if (activeSeg === "settled") {
                    return (
                      <EmptyState
                        title="No Settled Contracts"
                        subtitle="Fulfilled tasks and completed equipment returns will appear here with on-chain payout receipts."
                        icon={<ShieldCheck size={32} />}
                        action={{ label: "Browse Radar", onClick: () => setTab("radar") }}
                      />
                    );
                  }
                  return (
                    <EmptyState
                      title="No Refunded Contracts"
                      subtitle="Cancelled or expired escrows where funds were returned will appear here."
                      icon={<UnlockIcon size={32} />}
                    />
                  );
                }

                return filteredEscrows.map((e) => {
                  const listing = listings.find((l) => l.id === e.listingId);
                  const isSponsor = listing?.owner === accounts[0];
                  const isHunter = e.borrower === accounts[0];
                  const kind = listing?.kind || "borrow";
                  const effectiveDeadline = (e as any).deadlineAt ? Number((e as any).deadlineAt) : e.expiresAt;

                  const handleSuccess = () => {
                    setEscrows((p) => p.map((x) => (x.id === e.id ? { ...x, state: "released" } : x)));
                    setPayoffAmount(e.amountNIM);
                  };

                  return (
                    <div key={e.id} className="ledger-entry">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            {isSponsor ? (
                              <span className="rounded-md px-1.5 py-0.5 text-[8.5px] font-extrabold tracking-widest uppercase bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--gold)]/30">
                                SPONSOR
                              </span>
                            ) : (
                              <span className="rounded-md px-1.5 py-0.5 text-[8.5px] font-extrabold tracking-widest uppercase bg-[var(--sky)]/20 text-[var(--sky)] border border-[var(--sky)]/30">
                                {kind === "borrow" ? "BORROWER" : "HUNTER"}
                              </span>
                            )}
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase ${
                                e.state === "locked"
                                  ? "bg-[var(--gold)]/15 text-[var(--gold)]"
                                  : e.state === "released"
                                  ? "bg-[var(--verdigris)]/15 text-[var(--verdigris)]"
                                  : "bg-[var(--wax)]/15 text-[var(--wax)]"
                              }`}
                            >
                              {e.state}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-[var(--ink)]">{e.title}</h4>
                          <p className="tnum mt-0.5 text-lg font-extrabold text-[var(--ink)]">
                            {e.amountNIM.toLocaleString()} <span className="text-xs text-[var(--ink3)]">NIM</span>
                          </p>
                        </div>

                        {/* Counterparty badge / address */}
                        <div className="text-right">
                          <p className="text-[9px] text-[var(--ink3)] uppercase tracking-wider font-semibold">
                            {isSponsor ? "Counterparty" : "Sponsor"}
                          </p>
                          <button
                            onClick={() => setProfileAddr(isSponsor ? e.borrower : (listing?.owner || ""))}
                            className="font-mono text-[10px] text-[var(--sky)] hover:underline font-semibold"
                          >
                            {(isSponsor ? e.borrower : (listing?.owner || "")).slice(0, 10)}…
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[var(--ink3)] uppercase tracking-widest font-semibold">
                        <span className="tnum">Tx: {e.txHash ? e.txHash.slice(0, 14) + "..." : "Simulated"}</span>
                        <span>Fee: {e.feeNIM} NIM</span>
                        {(e as any).progress ? <span>· {String((e as any).progress).replace(/_/g, " ")}</span> : null}
                      </div>

                      {/* Unified single deadline timer */}
                      {e.state === "locked" && effectiveDeadline ? (
                        <div className="mt-2.5 flex items-center justify-between text-xs text-[var(--ink3)] border-t border-[var(--line)]/10 pt-2">
                          <div className="flex items-center gap-1.5">
                            <ClockIcon size={12} />
                            <span>Expires in:</span>
                            <span className="font-semibold text-[var(--ink)]">{timeRemaining(effectiveDeadline)}</span>
                          </div>
                          {(e as any).deadlineAt ? (
                            <span className="text-[10px] text-[var(--ink3)]">Due {new Date(Number((e as any).deadlineAt)).toLocaleDateString()}</span>
                          ) : null}
                        </div>
                      ) : null}

                      {/* Role-tailored action panel */}
                      {e.state === "locked" && (
                        <>
                          {e.borrower === accounts[0] && (
                            <button
                              onClick={() => handleCancel("escrow", e.id)}
                              disabled={isDemoMode}
                              className="mt-2 w-full disabled:opacity-50 py-1.5 bg-[var(--wax)]/10 border border-[var(--wax)]/20 text-[var(--wax)] rounded-md text-[10px] uppercase font-bold hover:bg-[var(--wax)]/20"
                            >
                              Cancel & Refund
                            </button>
                          )}

                          {(() => {
                            if (kind === "bounty") {
                              if (isSponsor) {
                                return (
                                  <div className="mt-3 rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 p-3 text-center">
                                    <p className="text-xs font-bold text-[var(--gold)] mb-1">Autonomous Vision Oracle</p>
                                    <p className="text-xs text-[var(--ink2)] leading-relaxed">
                                      Hunter completes the task and submits photo proof directly to the AI Vision Oracle for cryptographic release.
                                    </p>
                                  </div>
                                );
                              }
                              if ((listing as any)?.requireLocation) {
                                return <CheckInVerify listingId={e.listingId} onSuccess={handleSuccess} />;
                              }
                              return <BountyVerify task={e.title} listingId={e.listingId} onSuccess={handleSuccess} />;
                            } else if (kind === "bounty_venture") {
                              if (isSponsor) {
                                return (
                                  <div className="mt-3 rounded-xl border border-[var(--sky)]/20 bg-[var(--sky)]/5 p-3.5 text-center">
                                    <p className="text-xs font-bold text-[var(--sky)] mb-1">Venture Challenge In Progress</p>
                                    <p className="text-xs text-[var(--ink2)] mb-3 leading-relaxed">
                                      Hunter submits proof online. Submissions appear in your "Awaiting me" tab for review and payout.
                                    </p>
                                    <button
                                      onClick={() => {
                                        setActiveSeg("awaiting");
                                        setSeenTabs((p) => ({ ...p, awaiting: true }));
                                      }}
                                      className="w-full py-2 px-3 rounded-lg bg-[var(--sky)]/20 hover:bg-[var(--sky)]/30 text-[var(--sky)] font-bold text-xs transition-all btn-press"
                                    >
                                      Check Submissions in Awaiting Me →
                                    </button>
                                  </div>
                                );
                              }
                              return <VentureVerify listingId={e.listingId} />;
                            } else if (kind === "bounty_manual") {
                              return (
                                <ManualVerify
                                  listingId={e.listingId}
                                  isOwner={isSponsor}
                                  onScan={() => setShowScanner(true)}
                                />
                              );
                            } else if (kind === "bounty_geo") {
                              if (isSponsor) {
                                return (
                                  <div className="mt-3 rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 p-3 text-center">
                                    <p className="text-xs font-bold text-[var(--gold)] mb-1">GPS Location Oracle</p>
                                    <p className="text-xs text-[var(--ink2)] leading-relaxed">
                                      Hunter checks in via device GPS coordinates to verify physical location and claim reward.
                                    </p>
                                  </div>
                                );
                              }
                              return <CheckInVerify listingId={e.listingId} onSuccess={handleSuccess} />;
                            } else if (kind === "bounty_qr") {
                              if (isSponsor) {
                                return (
                                  <button
                                    onClick={async () => {
                                      const res = await apiFetch("/api/qr/generate", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ type: "scan_quest", escrowId: e.listingId, amount: e.amountNIM, chain: "nimiq-testnet" }),
                                      });
                                      const data = await res.json();
                                      if (res.ok) setQrToken({ token: data.token, escrow: e });
                                      else toast(data.error, "error");
                                    }}
                                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--sky)] py-2.5 text-xs font-bold text-[#181206] transition-all btn-press"
                                  >
                                    <QrCode size={14} /> Show Quest QR
                                  </button>
                                );
                              }
                              return (
                                <button
                                  onClick={() => setShowScanner(true)}
                                  disabled={isDemoMode}
                                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--sky)]/15 px-5 py-3 text-sm font-semibold text-[var(--sky)] transition-all hover:bg-[var(--sky)]/25 btn-press disabled:opacity-50"
                                >
                                  <ScanIcon size={14} /> Scan ScanQuest QR
                                </button>
                              );
                            }

                            // Equipment Borrow / Lend Flow:
                            if (isSponsor) {
                              return (
                                <div className="mt-3 rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 p-3.5 text-center">
                                  <p className="text-xs font-bold text-[var(--gold)] mb-1">Lender Custody Flow</p>
                                  <p className="text-xs text-[var(--ink2)] mb-3 leading-relaxed">
                                    When the borrower returns your equipment in good condition, show this QR code to release their collateral deposit.
                                  </p>
                                  <button
                                    onClick={() => handleMakeLenderQr(e)}
                                    disabled={isDemoMode}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)] py-2.5 text-xs font-bold text-[#1c1508] transition-all hover:bg-[var(--gold2)] btn-press disabled:opacity-50 shadow-sm"
                                  >
                                    <StarIcon size={14} /> Show Return QR to Borrower
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <div className="mt-3 rounded-xl border border-[var(--sky)]/20 bg-[var(--sky)]/5 p-3.5 text-center">
                                <p className="text-xs font-bold text-[var(--sky)] mb-1">Borrower Return Flow</p>
                                <p className="text-xs text-[var(--ink2)] mb-3 leading-relaxed">
                                  Hand the equipment back to the owner. Once they verify receipt and display their return QR, scan it to reclaim your collateral.
                                </p>
                                <button
                                  onClick={() => setShowScanner(true)}
                                  disabled={isDemoMode}
                                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--sky)] py-2.5 text-xs font-bold text-[#1c1508] transition-all hover:opacity-90 btn-press disabled:opacity-50 shadow-sm"
                                >
                                  <ScanIcon size={14} /> Scan Lender Return QR
                                </button>
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          )}

          {tab === "passport" && (
            <div className="space-y-2 pb-10 animate-fade-in">
              <div className="folio px-5 py-6 text-center">
                <div className="flex flex-col items-center justify-center mb-4">
                  <Identicon address={accounts[0] || "NQ07 0000 0000 0000 0000 0000 0000 0000 0000"} size={72} ring={tier.color} />
                  <p className="mt-2 font-mono text-xs font-semibold text-[var(--ink)]">
                    {accounts[0] ? `${accounts[0].slice(0, 14)}…${accounts[0].slice(-6)}` : "Wallet not connected"}
                  </p>
                  <span
                    className="caps mt-1 text-[8.5px] font-bold px-2.5 py-0.5 rounded-full"
                    style={{
                      background: `color-mix(in srgb, ${tier.color} 15%, transparent)`,
                      color: tier.color,
                      border: `1px solid color-mix(in srgb, ${tier.color} 30%, transparent)`,
                    }}
                  >
                    {tier.name} Tier · {trustScore} Trust Score
                  </span>
                </div>
                <div className="flex justify-center">
                  <TrustRing score={trustScore} size={160} />
                </div>
                <p className="mt-4 text-sm text-[var(--ink3)] leading-relaxed">
                  Every contract successfully returned builds your on-chain reputation. Higher trust tiers unlock massive collateral discounts.
                </p>
                <div className="mt-4 flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pt-2 pb-1">
                  <div className="flex-1 min-w-[100px] shrink-0 snap-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <p className="tnum text-xl font-black text-[var(--ink)]">
                        {escrows.filter(e => e.borrower === borrower || (e as any).owner === borrower || (e as any).completer === borrower).length}
                      </p>
                      <InfoTooltip
                        title="Total Contracts"
                        content="Total number of covenants (borrow or bounty tasks) you have participated in as borrower, patron, or fulfiller."
                        size={11}
                      />
                    </div>
                    <p className="text-[9px] uppercase tracking-widest text-[var(--ink3)] mt-1">Contracts</p>
                  </div>

                  <div className="flex-1 min-w-[100px] shrink-0 snap-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <p className="tnum text-xl font-black text-[var(--verdigris)]">
                        {escrows.filter((e) => (e.borrower === borrower || (e as any).owner === borrower || (e as any).completer === borrower) && e.state === "released").length}
                      </p>
                      <InfoTooltip
                        title="Settled Contracts"
                        content="Contracts successfully completed with returned collateral and confirmed on-chain payouts."
                        size={11}
                      />
                    </div>
                    <p className="text-[9px] uppercase tracking-widest text-[var(--ink3)] mt-1">Settled</p>
                  </div>

                  <div className="flex-1 min-w-[100px] shrink-0 snap-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <p className="tnum text-xl font-black text-[var(--gold)]">{activeCount}</p>
                      <InfoTooltip
                        title="Active Contracts"
                        content="Escrows currently locked in progress or awaiting verification in your queue."
                        size={11}
                      />
                    </div>
                    <p className="text-[9px] uppercase tracking-widest text-[var(--ink3)] mt-1">Active</p>
                  </div>
                </div>
              </div>

              <PassportDashboard
                address={accounts[0] || null}
                isConnected={status === "connected" && !!accounts[0]}
                onSignIn={ensureAuth}
                onScoreLoaded={(score) => setUserTrustScore(score)}
                onViewProfile={setProfileAddr}
              />
              <FolioRule />
              <div className="px-4"><PassportDetails address={accounts[0]} /></div>
              <div className="px-4"><FolioRule mark="⁂" />
              <button
                onClick={() => setRefOpen(true)}
                className="ghost w-full rounded-2xl py-3 text-[12px] font-semibold text-[var(--gold2)]"
              >
                Invite friends — earn 10 NIM per settled act
              </button>
              </div>
            </div>
          )}
        </main>

        <EngravedTabs tab={tab} setTab={setTab} activeCount={activeCount} pulse={justSettled} />
        <Inbox open={inboxOpen} onClose={() => setInboxOpen(false)} onChanged={refreshUnread} />
        <ReferralSheet open={refOpen} onClose={() => setRefOpen(false)} address={accounts[0]} />
        <ProfileSheet address={profileAddr} onClose={() => setProfileAddr(null)} />
        <ListingDetailSheet
          listingId={reviewListingId}
          viewerTrust={trustScore}
          onAccept={(l) => { const full = listings.find((x) => x.id === l.id) ?? l; setWizard(full as any); }}
          onClose={() => setReviewListingId(null)}
          onShowQr={(token, escrow) => setQrToken({ token, escrow })}
        />

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
        <input ref={scanFileRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            const token = pendingScan;
            setPendingScan(null);
            if (!f || !token) return;
            try {
              const { fileToOptimizedDataUrl } = await import("@/lib/image");
              const imageUrl = await fileToOptimizedDataUrl(f);
              const res = await apiFetch("/api/bounty/scanquest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, imageUrl }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Scene check failed");
              toast("Quest completed! Reward claimed.", "success"); setPayoffAmount(-1);
              setJustSettled(true); setTimeout(() => setJustSettled(false), 5000); refetch(); refreshUnread();
            } catch (err) {
              toast(err instanceof Error ? err.message : "Scene check failed", "error");
            }
          }} />
        {showCreateListing && (
          <CreateListing
            onSubmit={handleCreateListing}
            onClose={() => {
              setShowCreateListing(false);
              setCreateKind(null);
            }}
            initialKind={createKind}
          />
        )}
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
        {payoffAmount !== null && <SuccessPayoff amount={payoffAmount} onClose={() => setPayoffAmount(null)} />}
      </div>
    </ErrorBoundary>
  );
}
