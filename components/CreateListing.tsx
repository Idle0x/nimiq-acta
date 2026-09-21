'use client';
import React, { useState } from 'react';
import AiOracleConfig from './AiOracleConfig';
import { DEFAULT_CONTRACT, oracleForKind, type ListingContract } from '@/lib/contract';
import {
  LockIcon,
  ZapIcon,
  MapPinIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  XIcon,
  Camera,
  QrCodeIcon,
  UserCheck,
  ShieldCheck,
  HelpCircle,
  FileText,
  Clock,
  Coins,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface CreateListingProps {
  onClose: () => void;
  onSubmit: (listing: {
    title: string;
    kind: 'borrow' | 'bounty' | 'bounty_venture' | 'bounty_qr' | 'bounty_manual' | 'bounty_geo';
    collateralNIM: number;
    description: string;
    borrowMode?: 'lend' | 'rent';
    durationDays?: number;
    requireLocation?: boolean;
    contract?: ListingContract;
    expiresAt?: number;
  }) => void;
  initialKind?: 'borrow' | 'bounty' | null;
}

const CreateListing: React.FC<CreateListingProps> = ({ onClose, onSubmit, initialKind = null }) => {
  const [step, setStep] = useState(initialKind === 'borrow' ? 1.2 : initialKind === 'bounty' ? 1.5 : 1);
  const [kind, setKind] = useState<'borrow' | 'bounty' | 'bounty_venture' | 'bounty_qr' | 'bounty_manual' | 'bounty_geo' | null>(initialKind ?? null);
  const [borrowMode, setBorrowMode] = useState<'lend' | 'rent'>('lend');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [durationDays, setDurationDays] = useState(3);
  const [description, setDescription] = useState('');
  const [requireLocation, setRequireLocation] = useState(false);
  const [contract, setContract] = useState<ListingContract>(DEFAULT_CONTRACT);

  const minStep = initialKind ? (initialKind === 'borrow' ? 1.2 : 1.5) : 1;

  const handleBack = () => {
    if (step === 3) {
      if (kind?.startsWith('bounty')) setStep(2.5);
      else setStep(2);
    } else if (step === 2.5) {
      setStep(2);
    } else if (step === 2) {
      if (kind === 'borrow') setStep(1.2);
      else if (kind?.startsWith('bounty')) setStep(1.5);
      else setStep(1);
    } else if (step === 1.5 || step === 1.2) {
      if (!initialKind) setStep(1);
      else onClose();
    }
  };

  const handleNext = () => {
    if (step === 1 && kind) {
      if (kind === 'borrow') setStep(1.2);
      else if (kind === 'bounty') setStep(1.5);
    } else if (step === 1.2) {
      setKind('borrow');
      setStep(2);
    } else if (step === 1.5 && kind) {
      setStep(2);
    } else if (step === 2 && title && amount && description) {
      if (!(parseFloat(amount) >= 0.01)) return;
      if (kind!.startsWith('bounty')) setStep(2.5);
      else setStep(3);
    } else if (step === 2.5) {
      const oracle = oracleForKind(kind!);
      if ((oracle === 'vision' || oracle === 'qr' || oracle === 'geo') && !contract.criteria.trim()) return;
      setStep(3);
    } else if (step === 3) {
      onSubmit({
        title,
        kind: kind!,
        collateralNIM: parseFloat(amount),
        description,
        borrowMode: kind === 'borrow' ? borrowMode : undefined,
        durationDays: kind === 'borrow' ? durationDays : undefined,
        ...(kind!.startsWith('bounty')
          ? {
              requireLocation: kind === 'bounty_geo' ? true : requireLocation,
              contract,
              expiresAt: Date.now() + contract.expiresInHours * 3600 * 1000,
            }
          : {}),
      });
    }
  };

  return (
    <div className="app-ink fixed inset-0 z-[100] bg-[var(--bg)] flex flex-col">
      {/* Header */}
      <div className="bg-[var(--surface)]/80 backdrop-blur p-4 flex items-center justify-between border-b border-[var(--line)]/5">
        <div className="flex items-center gap-2">
          {step > minStep && (
            <button onClick={handleBack} className="p-1.5 text-[var(--ink3)] hover:text-[var(--ink)] bg-[var(--surface2)] rounded-full">
              <ChevronLeftIcon size={18} />
            </button>
          )}
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            {kind === 'borrow'
              ? step === 1.2
                ? 'Lend / Borrow Equipment'
                : borrowMode === 'lend'
                ? 'Lend (Provide Equipment)'
                : 'Borrow (Seek Equipment)'
              : kind?.startsWith('bounty')
              ? 'Deploy Protocol Bounty'
              : 'Create Listing'}
          </h2>
        </div>
        <button onClick={onClose} className="p-2 text-[var(--ink3)] hover:text-[var(--ink)] bg-[var(--surface2)] rounded-full">
          <XIcon size={20} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-1 p-4 bg-[var(--surface)]/50">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full ${
              s <= Math.floor(step === 1.2 || step === 1.5 ? 1 : step) ? 'bg-[var(--gold)]' : 'bg-[var(--surface2)]'
            }`}
          />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 custom-parchment-scrollbar">
        {/* STEP 1: Main Category */}
        {step === 1 && (
          <>
            <div>
              <h3 className="text-xl font-bold text-[var(--ink)] mb-1">What do you want to create?</h3>
              <p className="text-xs text-[var(--ink3)] leading-relaxed">
                Select whether to deal with physical equipment (borrowing or lending) or deploy a funded bounty reward for verified tasks.
              </p>
            </div>

            <button
              onClick={() => {
                setKind('borrow');
                setStep(1.2);
              }}
              className="p-5 rounded-2xl border text-left flex items-start gap-4 transition-colors bg-[var(--surface)] border-[var(--line)]/10 hover:border-[var(--sky)]/50 group"
            >
              <div className="p-3 rounded-xl bg-[var(--sky)]/10 text-[var(--sky)] group-hover:scale-105 transition-transform">
                <LockIcon size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-[var(--ink)] mb-1">Physical Equipment (Lend & Borrow)</h4>
                  <span className="text-[10px] uppercase font-bold text-[var(--sky)] bg-[var(--sky)]/10 px-2 py-0.5 rounded-full">
                    Escrow Covenant
                  </span>
                </div>
                <p className="text-xs text-[var(--ink3)] leading-relaxed">
                  List items you own to lend out safely, or broadcast a request to rent equipment from the community with collateral protection.
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setKind('bounty');
                setStep(1.5);
              }}
              className="p-5 rounded-2xl border text-left flex items-start gap-4 transition-colors bg-[var(--surface)] border-[var(--line)]/10 hover:border-[var(--gold)]/50 group"
            >
              <div className="p-3 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)] group-hover:scale-105 transition-transform">
                <ZapIcon size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-[var(--ink)] mb-1">Task Bounty Challenge</h4>
                  <span className="text-[10px] uppercase font-bold text-[var(--gold)] bg-[var(--gold)]/10 px-2 py-0.5 rounded-full">
                    Prize Vault
                  </span>
                </div>
                <p className="text-xs text-[var(--ink3)] leading-relaxed">
                  Lock a reward in the autonomous vault for someone to earn upon completing a verified task (Vision AI, GPS, QR token, or manual sign-off).
                </p>
              </div>
            </button>
          </>
        )}

        {/* STEP 1.2: Choose Borrow Intent (Lend vs Rent) */}
        {step === 1.2 && (
          <>
            <div>
              <h3 className="text-xl font-bold text-[var(--ink)] mb-1">Choose Equipment Role</h3>
              <p className="text-xs text-[var(--ink3)] leading-relaxed">
                Determine your side in this covenant. Are you providing the asset or seeking to rent it? This dictates whether a transaction is broadcasted now.
              </p>
            </div>

            {/* Option A: List Item as Available */}
            <button
              onClick={() => {
                setBorrowMode('lend');
                setKind('borrow');
                setStep(2);
              }}
              className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all ${
                borrowMode === 'lend'
                  ? 'bg-[var(--sky)]/10 border-[var(--sky)] shadow-sm'
                  : 'bg-[var(--surface)] border-[var(--line)]/10 hover:border-[var(--sky)]/40'
              }`}
            >
              <div className="p-3 rounded-xl bg-[var(--sky)]/20 text-[var(--sky)] shrink-0">
                <LockIcon size={22} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <h4 className="text-base font-bold text-[var(--ink)] flex items-center gap-1.5">
                    <span>Lend</span>
                    <span className="text-xs font-normal text-[var(--ink3)]">(List Item as Available)</span>
                  </h4>
                  <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--verdigris)]/15 text-[var(--verdigris)] border border-[var(--verdigris)]/30">
                    0 NIM Upfront · No Broadcast
                  </span>
                </div>
                <p className="text-xs text-[var(--ink2)] leading-relaxed">
                  You own physical gear and are making it available for others to rent.
                </p>
                <div className="mt-2 p-2.5 rounded-xl bg-[var(--surface2)]/60 border border-[var(--line)]/10 text-[11px] text-[var(--ink3)]">
                  <strong className="text-[var(--ink)] block mb-0.5">Financial Behavior:</strong>
                  Your funds are <span className="text-[var(--verdigris)] font-bold">NOT deducted</span>. No blockchain transaction is sent right now. When a borrower accepts your offer, they will lock the required collateral into the smart vault.
                </div>
              </div>
            </button>

            {/* Option B: Request to Rent an Item */}
            <button
              onClick={() => {
                setBorrowMode('rent');
                setKind('borrow');
                setStep(2);
              }}
              className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all ${
                borrowMode === 'rent'
                  ? 'bg-[var(--sky)]/10 border-[var(--sky)] shadow-sm'
                  : 'bg-[var(--surface)] border-[var(--line)]/10 hover:border-[var(--sky)]/40'
              }`}
            >
              <div className="p-3 rounded-xl bg-[var(--gold)]/20 text-[var(--gold)] shrink-0">
                <Coins size={22} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <h4 className="text-base font-bold text-[var(--ink)] flex items-center gap-1.5">
                    <span>Borrow</span>
                    <span className="text-xs font-normal text-[var(--ink3)]">(Request to Rent an Item)</span>
                  </h4>
                  <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30">
                    Broadcasts Transaction
                  </span>
                </div>
                <p className="text-xs text-[var(--ink2)] leading-relaxed">
                  You need equipment and are posting a request to the community.
                </p>
                <div className="mt-2 p-2.5 rounded-xl bg-[var(--surface2)]/60 border border-[var(--line)]/10 text-[11px] text-[var(--ink3)]">
                  <strong className="text-[var(--ink)] block mb-0.5">Financial Behavior:</strong>
                  A blockchain transaction <span className="text-[var(--gold)] font-bold">WILL be broadcasted</span> from your Nimiq wallet to lock your collateral deposit into the protocol vault upon publishing.
                </div>
              </div>
            </button>
          </>
        )}

        {/* STEP 1.5: Bounty Challenge Types */}
        {step === 1.5 && (
          <>
            <div>
              <h3 className="text-xl font-bold text-[var(--ink)] mb-1">Choose Challenge Type</h3>
              <p className="text-xs text-[var(--ink3)] leading-relaxed">
                Select how participants will verify completion. The reward amount will be locked into the protocol smart vault upon publishing.
              </p>
            </div>
            <button
              onClick={() => { setKind('bounty'); setStep(2); }}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty' ? 'bg-[var(--gold)]/10 border-[var(--gold)]' : 'bg-[var(--surface)] border-[var(--line)]/5 hover:border-[var(--line)]/20'
              }`}
            >
              <Camera size={24} className={kind === 'bounty' ? 'text-[var(--gold)]' : 'text-[var(--ink3)]'} />
              <div>
                <h4 className="text-md font-semibold text-[var(--ink)]">Vision Oracle (PhotoProof)</h4>
                <p className="text-xs text-[var(--ink3)]">Creative and practical challenges where Google Gemini AI inspects high-res photo proof.</p>
              </div>
            </button>
            <button
              onClick={() => { setKind('bounty_geo'); setStep(2); }}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty_geo' ? 'bg-[var(--gold)]/10 border-[var(--gold)]' : 'bg-[var(--surface)] border-[var(--line)]/5 hover:border-[var(--line)]/20'
              }`}
            >
              <MapPinIcon size={24} className={kind === 'bounty_geo' ? 'text-[var(--gold)]' : 'text-[var(--ink3)]'} />
              <div>
                <h4 className="text-md font-semibold text-[var(--ink)]">GPS Check-In</h4>
                <p className="text-xs text-[var(--ink3)]">Be there: Physical presence within target geofence coordinates unlocks reward.</p>
              </div>
            </button>
            <button
              onClick={() => { setKind('bounty_qr'); setStep(2); }}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty_qr' ? 'bg-[var(--gold)]/10 border-[var(--gold)]' : 'bg-[var(--surface)] border-[var(--line)]/5 hover:border-[var(--line)]/20'
              }`}
            >
              <QrCodeIcon size={24} className={kind === 'bounty_qr' ? 'text-[var(--gold)]' : 'text-[var(--ink3)]'} />
              <div>
                <h4 className="text-md font-semibold text-[var(--ink)]">ScanQuest Token</h4>
                <p className="text-xs text-[var(--ink3)]">Cryptographic geocache: Participant finds and scans your single-use signed QR code on-site.</p>
              </div>
            </button>
            <button
              onClick={() => { setKind('bounty_manual'); setStep(2); }}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty_manual' ? 'bg-[var(--gold)]/10 border-[var(--gold)]' : 'bg-[var(--surface)] border-[var(--line)]/5 hover:border-[var(--line)]/20'
              }`}
            >
              <UserCheck size={24} className={kind === 'bounty_manual' ? 'text-[var(--gold)]' : 'text-[var(--ink3)]'} />
              <div>
                <h4 className="text-md font-semibold text-[var(--ink)]">In-Person Verification</h4>
                <p className="text-xs text-[var(--ink3)]">Tasks where you personally meet the participant, inspect work, and scan their code to approve.</p>
              </div>
            </button>
            <button
              onClick={() => { setKind('bounty_venture'); setStep(2); }}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty_venture' ? 'bg-[var(--gold)]/10 border-[var(--gold)]' : 'bg-[var(--surface)] border-[var(--line)]/5 hover:border-[var(--line)]/20'
              }`}
            >
              <FileText size={24} className={kind === 'bounty_venture' ? 'text-[var(--gold)]' : 'text-[var(--ink3)]'} />
              <div>
                <h4 className="text-md font-semibold text-[var(--ink)]">Online Venture / Deliverables</h4>
                <p className="text-xs text-[var(--ink3)]">Digital milestones (code, design, links, docs) pre-screened by AI and confirmed by sponsor.</p>
              </div>
            </button>
          </>
        )}

        {/* STEP 2: Details & Pricing */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-[var(--ink)] mb-1">Enter Listing Details</h3>
              <p className="text-xs text-[var(--ink3)] leading-relaxed">
                Provide comprehensive specifications so counterparties understand the full covenant.
              </p>
            </div>

            {/* Financial behavior banner */}
            <div
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                kind === 'borrow'
                  ? borrowMode === 'lend'
                    ? 'bg-[var(--verdigris)]/10 border-[var(--verdigris)]/30 text-[var(--verdigris)]'
                    : 'bg-[var(--gold)]/10 border-[var(--gold)]/30 text-[var(--gold2)]'
                  : 'bg-[var(--gold)]/10 border-[var(--gold)]/30 text-[var(--gold2)]'
              }`}
            >
              {kind === 'borrow' ? (
                borrowMode === 'lend' ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[var(--verdigris)]" />
                    <div>
                      <strong className="block text-[var(--ink)] mb-0.5">Lender Mode · 0 NIM Upfront</strong>
                      Your funds will NOT be deducted upon publishing. No transaction will be broadcast right now. The borrower will lock collateral into the smart vault upon rental.
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-[var(--gold)]" />
                    <div>
                      <strong className="block text-[var(--ink)] mb-0.5">Borrower Mode · Broadcasts Transaction</strong>
                      You will be asked to sign an on-chain transaction in Nimiq Pay to lock your collateral deposit into the protocol smart vault upon publishing.
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-[var(--gold)]" />
                  <div>
                    <strong className="block text-[var(--ink)] mb-0.5">Sponsor Bounty · Broadcasts Transaction</strong>
                    Your wallet will sign an on-chain transaction to transfer and lock your bounty reward into the autonomous protocol vault upon publishing.
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--ink3)] mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={kind === 'borrow' ? 'e.g. Sony Alpha A7 IV Camera Body' : 'e.g. Clean up litter at Ocean Beach park'}
                className="w-full bg-[var(--bg)] border border-[var(--line)]/15 rounded-xl p-3.5 text-[var(--ink)] placeholder:text-[var(--ink3)] focus:outline-none focus:border-[var(--gold)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--ink3)] mb-1">
                {kind === 'borrow'
                  ? borrowMode === 'lend'
                    ? 'Required Collateral (NIM) — locked by borrower upon rental'
                    : 'Collateral Deposit (NIM) — locked into vault by you upon publishing'
                  : 'Bounty Prize Reward (NIM) — locked into vault by you upon publishing'}
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00 (min 0.01 NIM)"
                className="w-full bg-[var(--bg)] border border-[var(--line)]/15 rounded-xl p-3.5 text-[var(--ink)] placeholder:text-[var(--ink3)] focus:outline-none focus:border-[var(--gold)] font-mono tnum"
              />
            </div>

            {kind === 'borrow' && (
              <div>
                <label className="block text-sm font-medium text-[var(--ink3)] mb-1">Covenant Duration (Days)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 7, 14, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDurationDays(d)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        durationDays === d
                          ? 'bg-[var(--sky)] text-[#181206] border-[var(--sky)]'
                          : 'bg-[var(--surface2)] text-[var(--ink2)] border-[var(--line)]/15 hover:border-[var(--line)]/30'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--ink3)] mb-1">Description & Requirements</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  kind === 'borrow'
                    ? 'State equipment condition, included accessories, pickup/return protocol, and handling instructions...'
                    : 'Describe the task in detail, expectations, and any context helpful for challengers...'
                }
                rows={4}
                className="w-full bg-[var(--bg)] border border-[var(--line)]/15 rounded-xl p-3.5 text-[var(--ink)] placeholder:text-[var(--ink3)] focus:outline-none focus:border-[var(--gold)] resize-none"
              />
            </div>

            {kind?.startsWith('bounty') && (
              <label className="flex items-center justify-between p-3.5 bg-[var(--surface)] border border-[var(--line)]/10 rounded-xl cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--surface2)] rounded-lg text-[var(--ink3)]">
                    <MapPinIcon size={18} />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-[var(--ink)]">Require Physical Location</span>
                    <span className="text-xs text-[var(--ink3)]">Challengers must be physically at the location to submit proof</span>
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${requireLocation ? 'bg-[var(--gold)]' : 'bg-[var(--surface2)]'}`}
                  onClick={() => setRequireLocation(!requireLocation)}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      requireLocation ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </div>
              </label>
            )}
          </div>
        )}

        {/* STEP 2.5: AI Oracle Config for Bounties */}
        {step === 2.5 && kind?.startsWith('bounty') && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-[var(--ink)] mb-1">Set the Contract Criteria</h3>
              <p className="text-xs text-[var(--ink3)] leading-relaxed">
                Configure automated criteria, execution deadlines, and verification rules that programmatically govern how vault funds are released.
              </p>
            </div>
            <AiOracleConfig kind={kind!} value={contract} onChange={setContract} />
          </div>
        )}

        {/* STEP 3: Review & Contract Covenant Preview */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-[var(--ink)] mb-1">Review & Sign Covenant</h3>
              <p className="text-xs text-[var(--ink3)] leading-relaxed">
                Carefully review all terms and conditions before publishing. Once confirmed, this agreement becomes governed by autonomous protocol rules.
              </p>
            </div>

            {/* Overview Card */}
            <div className="bg-[var(--surface)] border border-[var(--line)]/15 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="caps text-[8px] font-extrabold tracking-wider text-[var(--ink3)]">
                    {kind === 'borrow' ? (borrowMode === 'lend' ? 'Available Asset Offer' : 'Equipment Rental Request') : 'Bounty Challenge'}
                  </span>
                  <h4 className="text-lg font-bold text-[var(--ink)] mt-0.5">{title}</h4>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xl font-black text-[var(--ink)] tnum">{amount} NIM</span>
                  <p className="text-[9px] text-[var(--ink3)]">
                    {kind === 'borrow' ? (borrowMode === 'lend' ? 'Collateral asked' : 'Collateral offered') : 'Prize purse'}
                  </p>
                </div>
              </div>

              {description && (
                <p className="text-xs text-[var(--ink2)] leading-relaxed p-2.5 rounded-xl bg-[var(--surface2)]/50 border border-[var(--line)]/10">
                  {description}
                </p>
              )}
            </div>

            {/* CONTRACT COVENANT & TERMS PREVIEW (The requested terms preview right before publishing) */}
            <div className="rounded-2xl border border-[var(--gold)]/30 bg-[color-mix(in_srgb,var(--gold)_5%,transparent)] p-4 space-y-3">
              <div className="flex items-center gap-2 text-[var(--gold)] font-bold text-xs">
                <ShieldCheck size={16} />
                <span>Contract Covenant Terms & Conditions</span>
              </div>

              <div className="space-y-2.5 text-[11.5px] text-[var(--ink2)] leading-relaxed">
                {/* 1. Broadcast Behavior */}
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0 mt-1.5" />
                  <div>
                    <strong className="text-[var(--ink)]">Transaction Broadcast: </strong>
                    {kind === 'borrow' ? (
                      borrowMode === 'lend' ? (
                        <span>
                          <strong className="text-[var(--verdigris)]">NO funds deducted from your wallet on publishing.</strong> As the lender offering an available asset, your upfront cost is 0 NIM. When a borrower accepts your listing, they will broadcast the transaction locking the required {amount} NIM collateral.
                        </span>
                      ) : (
                        <span>
                          <strong className="text-[var(--gold)]">A transaction for {amount} NIM will be broadcasted right now.</strong> As the requester seeking to borrow, your collateral deposit will move into the autonomous vault smart contract upon publishing.
                        </span>
                      )
                    ) : (
                      <span>
                        <strong className="text-[var(--gold)]">A transaction for {amount} NIM will be broadcasted right now.</strong> The bounty prize moves into the protocol vault smart contract upon publishing and stays locked until a valid proof is verified.
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Custody */}
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0 mt-1.5" />
                  <div>
                    <strong className="text-[var(--ink)]">Non-Custodial Smart Vault: </strong>
                    Funds are held in autonomous smart contracts on the Nimiq blockchain. Neither Acta nor any centralized third party holds custody of funds.
                  </div>
                </div>

                {/* 3. Verification Protocol */}
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0 mt-1.5" />
                  <div>
                    <strong className="text-[var(--ink)]">Verification & Release: </strong>
                    {kind === 'borrow'
                      ? 'Collateral unlocks when the equipment is physically returned and the Return QR code is scanned.'
                      : kind === 'bounty_geo'
                      ? 'Hardware device GPS calculates distance to coordinates within perimeter to trigger automatic vault payout.'
                      : kind === 'bounty_qr'
                      ? 'Single-use cryptographic signed token must be discovered and scanned on-site to claim reward.'
                      : kind === 'bounty_manual'
                      ? 'Sponsor personally meets participant and scans completion code to authorize payout.'
                      : kind === 'bounty_venture'
                      ? 'Digital deliverables are submitted in app, pre-screened by AI, and approved by sponsor.'
                      : 'Google Gemini Multimodal Vision AI inspects photo proof against criteria prompt to authorize payout.'}
                  </div>
                </div>

                {/* 4. Settlement Fee */}
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0 mt-1.5" />
                  <div>
                    <strong className="text-[var(--ink)]">Settlement Fee: </strong>
                    Standard 0.0011 NIM protocol settlement and network fee applies upon contract completion and release.
                  </div>
                </div>

                {/* 5. Cancellation & Refunds */}
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0 mt-1.5" />
                  <div>
                    <strong className="text-[var(--ink)]">Cancellation: </strong>
                    If unaccepted, you can cancel this listing at any time for an immediate 100% full refund of your vault deposit.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="p-4 bg-[var(--bg)] border-t border-[var(--line)]/10">
        <button
          onClick={handleNext}
          disabled={
            (step === 1 && !kind) ||
            (step === 2 && (!title || !amount || !(parseFloat(amount) >= 0.01) || !description))
          }
          className="w-full py-4 bg-[var(--gold)] hover:bg-[var(--gold2)] text-[#181206] rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md btn-press"
        >
          {step === 3 ? (
            kind === 'borrow' ? (
              borrowMode === 'lend' ? (
                'Publish Rental Listing (0 NIM Upfront)'
              ) : (
                `Sign & Broadcast Rental Request (${amount} NIM)`
              )
            ) : (
              `Sign & Fund Bounty (${amount} NIM)`
            )
          ) : (
            'Next'
          )}
          {step < 3 && <ChevronRightIcon size={20} />}
        </button>
      </div>
    </div>
  );
};

export default CreateListing;
