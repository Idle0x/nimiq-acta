'use client';
import React, { useState } from 'react';
import AiOracleConfig from './AiOracleConfig';
import { DEFAULT_CONTRACT, oracleForKind, type ListingContract } from '@/lib/contract';
import { LockIcon, ZapIcon, MapPinIcon, ChevronRightIcon, ChevronLeftIcon, XIcon, Camera, QrCodeIcon, UserCheck } from 'lucide-react';

interface CreateListingProps {
  onClose: () => void;
  onSubmit: (listing: { title: string; kind: 'borrow' | 'bounty' | 'bounty_venture' | 'bounty_qr' | 'bounty_manual' | 'bounty_geo'; collateralNIM: number; description: string; requireLocation?: boolean; contract?: ListingContract; expiresAt?: number }) => void;
  initialKind?: 'borrow' | 'bounty' | null;
}

const CreateListing: React.FC<CreateListingProps> = ({ onClose, onSubmit, initialKind = null }) => {
  const [step, setStep] = useState(initialKind === 'borrow' ? 2 : initialKind === 'bounty' ? 1.5 : 1);
  const [kind, setKind] = useState<'borrow' | 'bounty' | 'bounty_venture' | 'bounty_qr' | 'bounty_manual' | 'bounty_geo' | null>(initialKind ?? null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [requireLocation, setRequireLocation] = useState(false);
  const [contract, setContract] = useState<ListingContract>(DEFAULT_CONTRACT);

  const minStep = initialKind === 'borrow' ? 2 : initialKind === 'bounty' ? 1.5 : 1;

  const handleBack = () => {
    if (step === 3) {
      if (kind?.startsWith('bounty')) setStep(2.5);
      else setStep(2);
    } else if (step === 2.5) {
      setStep(2);
    } else if (step === 2) {
      if (kind?.startsWith('bounty') && initialKind !== 'borrow') setStep(1.5);
      else if (!initialKind) setStep(1);
    } else if (step === 1.5) {
      if (!initialKind) setStep(1);
    }
  };

  const handleNext = () => {
    if (step === 1 && kind) {
      if (kind === 'bounty') setStep(1.5); // Choose bounty type
      else setStep(2);
    } else if (step === 1.5 && kind) {
      setStep(2);
    } else if (step === 2 && title && amount && description) {
      if (!(parseFloat(amount) >= 0.01)) return; // dust guard mirrors the server
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
        ...(kind!.startsWith('bounty')
          ? { requireLocation: kind === 'bounty_geo' ? true : requireLocation, contract, expiresAt: Date.now() + contract.expiresInHours * 3600 * 1000 }
          : {}),
      });
    }
  };

  return (
    <div className="app-ink fixed inset-0 z-[100] bg-[var(--bg)] flex flex-col">
      <div className="bg-[var(--surface)]/80 backdrop-blur p-4 flex items-center justify-between border-b border-[var(--line)]/5">
        <div className="flex items-center gap-2">
          {step > minStep && (
            <button onClick={handleBack} className="p-1.5 text-[var(--ink3)] hover:text-[var(--ink)] bg-[var(--surface2)] rounded-full">
              <ChevronLeftIcon size={18} />
            </button>
          )}
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            {kind?.startsWith('bounty') ? 'Deploy Protocol Bounty' : kind === 'borrow' ? 'List Asset for Borrowing' : 'Create Listing'}
          </h2>
        </div>
        <button onClick={onClose} className="p-2 text-[var(--ink3)] hover:text-[var(--ink)] bg-[var(--surface2)] rounded-full">
          <XIcon size={20} />
        </button>
      </div>

      <div className="flex gap-1 p-4 bg-[var(--surface)]/50">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= Math.floor(step) ? 'bg-[var(--gold)]' : 'bg-[var(--surface2)]'}`} />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {step === 1 && (
          <>
            <div>
              <h3 className="text-xl font-bold text-[var(--ink)] mb-1">What do you want to create?</h3>
              <p className="text-xs text-[var(--ink3)] leading-relaxed">
                Select whether to offer physical equipment for peer borrowing with refundable collateral, or deploy a funded bounty reward for verified tasks.
              </p>
            </div>
            <button
              onClick={() => setKind('borrow')}
              className={`p-6 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'borrow' ? 'bg-[var(--gold)]/10 border-[var(--gold)]' : 'bg-[var(--surface)] border-[var(--line)]/5 hover:border-[var(--line)]/20'
              }`}
            >
              <div className={`p-3 rounded-xl ${kind === 'borrow' ? 'bg-[var(--gold)] text-[var(--ink)]' : 'bg-[var(--surface2)] text-[var(--ink3)]'}`}>
                <LockIcon size={24} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-[var(--ink)] mb-1">List Asset to Lend</h4>
                <p className="text-sm text-[var(--ink3)]">Offer your gear for others to borrow. Borrowers will lock your required NIM collateral in escrow upon rental.</p>
              </div>
            </button>

            <button
              onClick={() => setKind('bounty')}
              className={`p-6 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind?.startsWith('bounty') ? 'bg-[var(--sky)]/10 border-[var(--sky)]' : 'bg-[var(--surface)] border-[var(--line)]/5 hover:border-[var(--line)]/20'
              }`}
            >
              <div className={`p-3 rounded-xl ${kind?.startsWith('bounty') ? 'bg-[var(--sky)] text-[var(--ink)]' : 'bg-[var(--surface2)] text-[var(--ink3)]'}`}>
                <ZapIcon size={24} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-[var(--ink)] mb-1">Create Bounty</h4>
                <p className="text-sm text-[var(--ink3)]">Create a task and reward NIM to whoever completes it.</p>
              </div>
            </button>
          </>
        )}

        {step === 1.5 && (
          <>
            <div>
              <h3 className="text-xl font-bold text-[var(--ink)] mb-1">Choose Challenge Type</h3>
              <p className="text-xs text-[var(--ink3)] leading-relaxed">
                Select how participants will verify completion. You can use AI Vision photo verification, GPS physical presence, ScanQuest QR discovery, or manual patron sign-off.
              </p>
            </div>
            <button
              onClick={() => setKind('bounty')}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty' ? 'bg-[var(--sky)]/10 border-[var(--sky)]' : 'bg-[var(--surface)] border-[var(--line)]/5 hover:border-[var(--line)]/20'
              }`}
            >
              <Camera size={24} className={kind === 'bounty' ? 'text-[var(--sky)]' : 'text-[var(--ink3)]'} />
              <div>
                <h4 className="text-md font-semibold text-[var(--ink)]">Showcase</h4>
                <p className="text-xs text-[var(--ink3)]">Creative and practical challenges where the result can be demonstrated visually.</p>
              </div>
            </button>
            <button
              onClick={() => setKind('bounty_venture')}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty_venture' ? 'bg-[var(--sky)]/10 border-[var(--sky)]' : 'bg-[var(--surface)] border-[var(--line)]/5 hover:border-[var(--line)]/20'
              }`}
            >
              <MapPinIcon size={24} className={kind === 'bounty_venture' ? 'text-[var(--sky)]' : 'text-[var(--ink3)]'} />
              <div>
                <h4 className="text-md font-semibold text-[var(--ink)]">Venture</h4>
                <p className="text-xs text-[var(--ink3)]">Anything-goes challenges built around ideas, activities, goals, and experiences.</p>
              </div>
            </button>
            <button
              onClick={() => setKind('bounty_geo')}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty_geo' ? 'bg-[var(--sky)]/10 border-[var(--sky)]' : 'bg-[var(--surface)] border-[var(--line)]/5 hover:border-[var(--line)]/20'
              }`}
            >
              <MapPinIcon size={24} className={kind === 'bounty_geo' ? 'text-[var(--sky)]' : 'text-[var(--ink3)]'} />
              <div>
                <h4 className="text-md font-semibold text-[var(--ink)]">CheckIn</h4>
                <p className="text-xs text-[var(--ink3)]">Be there: GPS proves presence within the bounty radius to unlock the reward.</p>
              </div>
            </button>
            <button
              onClick={() => setKind('bounty_qr')}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty_qr' ? 'bg-[var(--sky)]/10 border-[var(--sky)]' : 'bg-[var(--surface)] border-[var(--line)]/5 hover:border-[var(--line)]/20'
              }`}
            >
              <QrCodeIcon size={24} className={kind === 'bounty_qr' ? 'text-[var(--sky)]' : 'text-[var(--ink3)]'} />
              <div>
                <h4 className="text-md font-semibold text-[var(--ink)]">ScanQuest</h4>
                <p className="text-xs text-[var(--ink3)]">Discovery-based challenges centered around finding and unlocking hidden QR codes.</p>
              </div>
            </button>
            <button
              onClick={() => setKind('bounty_manual')}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty_manual' ? 'bg-[var(--sky)]/10 border-[var(--sky)]' : 'bg-[var(--surface)] border-[var(--line)]/5 hover:border-[var(--line)]/20'
              }`}
            >
              <UserCheck size={24} className={kind === 'bounty_manual' ? 'text-[var(--sky)]' : 'text-[var(--ink3)]'} />
              <div>
                <h4 className="text-md font-semibold text-[var(--ink)]">Request</h4>
                <p className="text-xs text-[var(--ink3)]">Real-world tasks, favors, and opportunities that require a completed submission.</p>
              </div>
            </button>
          </>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-[var(--ink)] mb-1">Enter Details</h3>
              <p className="text-xs text-[var(--ink3)] leading-relaxed">
                {kind === 'borrow'
                  ? 'Describe the asset and define the exact NIM collateral borrowers must lock in the vault. Collateral is returned in full upon safe return.'
                  : 'Define the task parameters, requirements, and reward amount in NIM. Your reward is locked upfront in escrow and released upon verification.'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink3)] mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={kind === 'borrow' ? 'e.g. Sony Camera' : 'e.g. Find lost keys'}
                className="w-full bg-[var(--bg)] border border-[var(--line)]/10 rounded-xl p-4 text-[var(--ink)] placeholder:text-[var(--ink3)] focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink3)] mb-1">
                {kind === 'borrow' ? 'Required Collateral (NIM)' : 'Reward Amount (NIM)'}
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00 (min 0.01)"
                className="w-full bg-[var(--bg)] border border-[var(--line)]/10 rounded-xl p-4 text-[var(--ink)] placeholder:text-[var(--ink3)] focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] tnum"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink3)] mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={4}
                className="w-full bg-[var(--bg)] border border-[var(--line)]/10 rounded-xl p-4 text-[var(--ink)] placeholder:text-[var(--ink3)] focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] resize-none"
              />
            </div>
            {kind?.startsWith('bounty') && (
              <label className="flex items-center justify-between p-4 bg-[var(--surface)] border border-[var(--line)]/5 rounded-xl cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--surface2)] rounded-lg text-[var(--ink3)]">
                    <MapPinIcon size={18} />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-[var(--ink)]">Require Location</span>
                    <span className="text-xs text-[var(--ink3)]">User must be at the location to claim</span>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${requireLocation ? 'bg-[var(--sky)]' : 'bg-[var(--surface2)]'}`} onClick={() => setRequireLocation(!requireLocation)}>
                  <div className={`w-4 h-4 bg-[color-mix(in_srgb,var(--gold)_8%,transparent)] rounded-full transition-transform ${requireLocation ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </label>
            )}
          </div>
        )}

        {step === 2.5 && kind?.startsWith('bounty') && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-[var(--ink)] mb-1">Set the contract</h3>
              <p className="text-xs text-[var(--ink3)] leading-relaxed">
                Configure automated verification criteria, execution time limits, and oracle rules that dictate how escrow funds are unlocked.
              </p>
            </div>
            <AiOracleConfig kind={kind!} value={contract} onChange={setContract} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[var(--ink)] mb-1">Review & Post</h3>
              <p className="text-xs text-[var(--ink3)] leading-relaxed">
                Verify all contract terms before submitting. Once confirmed, your listing will be broadcast across the protocol and visible on the peer radar.
              </p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--line)]/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4 border-b border-[var(--line)]/5 pb-4">
                <div className={`p-4 rounded-xl ${kind === 'borrow' ? 'bg-[var(--gold)]/10 text-[var(--gold)]' : 'bg-[var(--sky)]/10 text-[var(--sky)]'}`}>
                  {kind === 'borrow' ? <LockIcon size={32} /> : <ZapIcon size={32} />}
                </div>
                <div>
                  <div className="text-xs text-[var(--ink3)] uppercase tracking-wider mb-1">{kind === 'borrow' ? 'Asset to Lend' : 'Challenge'}</div>
                  <div className="text-xl font-bold text-[var(--ink)]">{title}</div>
                </div>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[var(--ink3)]">{kind === 'borrow' ? 'Borrower Collateral (Locked on rental)' : 'Bounty Deposit'}</span>
                <span className="font-semibold text-[var(--ink)] tnum">{amount} NIM</span>
              </div>
              {kind === 'borrow' && (
                <p className="text-[11px] text-[var(--ink3)] italic border-t border-[var(--line)]/5 pt-2">
                  No upfront deposit required to list. The borrower locks this collateral in escrow when taking custody.
                </p>
              )}
              <div className="py-2 text-sm text-[var(--ink2)] leading-relaxed">
                {description}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-[var(--bg)] border-t border-[var(--line)]/5">
        <button
          onClick={handleNext}
          disabled={step === 1 && !kind || step === 2 && (!title || !amount || !(parseFloat(amount) >= 0.01) || !description)}
          className="w-full py-4 bg-[var(--gold)] hover:bg-[var(--gold)] text-[var(--ink)] rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === 3 ? (kind === 'borrow' ? 'Publish Rental Listing' : 'Fund & Post Bounty') : 'Next'}
          {step < 3 && <ChevronRightIcon size={20} />}
        </button>
      </div>
    </div>
  );
};

export default CreateListing;
