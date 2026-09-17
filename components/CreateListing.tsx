'use client';
import React, { useState } from 'react';
import { LockIcon, ZapIcon, MapPinIcon, ChevronRightIcon, XIcon, Camera, QrCodeIcon, UserCheck } from 'lucide-react';

interface CreateListingProps {
  onClose: () => void;
  onSubmit: (listing: { title: string; kind: 'borrow' | 'bounty' | 'bounty_geo' | 'bounty_qr' | 'bounty_manual'; collateralNIM: number; description: string; requireLocation?: boolean }) => void;
}

const CreateListing: React.FC<CreateListingProps> = ({ onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<'borrow' | 'bounty' | 'bounty_geo' | 'bounty_qr' | 'bounty_manual' | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [requireLocation, setRequireLocation] = useState(false);

  const handleNext = () => {
    if (step === 1 && kind) {
      if (kind === 'bounty') setStep(1.5); // Choose bounty type
      else setStep(2);
    } else if (step === 1.5 && kind) {
      setStep(2);
    } else if (step === 2 && title && amount && description) {
      setStep(3);
    } else if (step === 3) {
      onSubmit({
        title,
        kind: kind!,
        collateralNIM: parseFloat(amount),
        description,
        ...(kind!.startsWith('bounty') ? { requireLocation } : {})
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col">
      <div className="bg-slate-900/80 backdrop-blur p-4 flex items-center justify-between border-b border-white/5">
        <h2 className="text-lg font-semibold text-slate-100">Create Listing</h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800 rounded-full">
          <XIcon size={20} />
        </button>
      </div>

      <div className="flex gap-1 p-4 bg-slate-900/50">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= Math.floor(step) ? 'bg-amber-300' : 'bg-slate-800'}`} />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {step === 1 && (
          <>
            <h3 className="text-xl font-bold text-slate-100 mb-2">What do you want to create?</h3>
            <button
              onClick={() => setKind('borrow')}
              className={`p-6 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'borrow' ? 'bg-amber-300/10 border-amber-300' : 'bg-slate-900 border-white/5 hover:border-white/20'
              }`}
            >
              <div className={`p-3 rounded-xl ${kind === 'borrow' ? 'bg-amber-300 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                <LockIcon size={24} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-100 mb-1">Borrow Item</h4>
                <p className="text-sm text-slate-400">Offer an item for others to borrow by locking NIM as collateral.</p>
              </div>
            </button>

            <button
              onClick={() => setKind('bounty')}
              className={`p-6 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind?.startsWith('bounty') ? 'bg-sky-400/10 border-sky-400' : 'bg-slate-900 border-white/5 hover:border-white/20'
              }`}
            >
              <div className={`p-3 rounded-xl ${kind?.startsWith('bounty') ? 'bg-sky-400 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                <ZapIcon size={24} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-100 mb-1">Create Bounty</h4>
                <p className="text-sm text-slate-400">Create a task and reward NIM to whoever completes it.</p>
              </div>
            </button>
          </>
        )}

        {step === 1.5 && (
          <>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Choose Challenge Type</h3>
            <button
              onClick={() => setKind('bounty')}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty' ? 'bg-sky-400/10 border-sky-400' : 'bg-slate-900 border-white/5 hover:border-white/20'
              }`}
            >
              <Camera size={24} className={kind === 'bounty' ? 'text-sky-400' : 'text-slate-400'} />
              <div>
                <h4 className="text-md font-semibold text-slate-100">PhotoProof (AI)</h4>
                <p className="text-xs text-slate-400">Vision AI verifies a photo automatically.</p>
              </div>
            </button>
            <button
              onClick={() => setKind('bounty_geo')}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty_qr' ? 'bg-sky-400/10 border-sky-400' : 'bg-slate-900 border-white/5 hover:border-white/20'
              }`}
            >
              <MapPinIcon size={24} className={kind === 'bounty_geo' ? 'text-sky-400' : 'text-slate-400'} />
              <div>
                <h4 className="text-md font-semibold text-slate-100">CheckIn (Geo)</h4>
                <p className="text-xs text-slate-400">User must be at a specific location.</p>
              </div>
            </button>
            <button
              onClick={() => setKind('bounty_qr')}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty_qr' ? 'bg-sky-400/10 border-sky-400' : 'bg-slate-900 border-white/5 hover:border-white/20'
              }`}
            >
              <QrCodeIcon size={24} className={kind === 'bounty_qr' ? 'text-sky-400' : 'text-slate-400'} />
              <div>
                <h4 className="text-md font-semibold text-slate-100">ScanQuest</h4>
                <p className="text-xs text-slate-400">User must scan a secure QR code you generate.</p>
              </div>
            </button>
            <button
              onClick={() => setKind('bounty_manual')}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty_manual' ? 'bg-sky-400/10 border-sky-400' : 'bg-slate-900 border-white/5 hover:border-white/20'
              }`}
            >
              <UserCheck size={24} className={kind === 'bounty_manual' ? 'text-sky-400' : 'text-slate-400'} />
              <div>
                <h4 className="text-md font-semibold text-slate-100">CreatorVerified</h4>
                <p className="text-xs text-slate-400">You manually approve the completion.</p>
              </div>
            </button>
          </>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Enter Details</h3>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={kind === 'borrow' ? 'e.g. Sony Camera' : 'e.g. Find lost keys'}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                {kind === 'borrow' ? 'Required Collateral (NIM)' : 'Reward Amount (NIM)'}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-300 tnum"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={4}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-300 resize-none"
              />
            </div>
            {kind?.startsWith('bounty') && (
              <label className="flex items-center justify-between p-4 bg-slate-900 border border-white/5 rounded-xl cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                    <MapPinIcon size={18} />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-slate-200">Require Location</span>
                    <span className="text-xs text-slate-400">User must be at the location to claim</span>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${requireLocation ? 'bg-sky-400' : 'bg-slate-700'}`} onClick={() => setRequireLocation(!requireLocation)}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${requireLocation ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </label>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Review & Post</h3>
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <div className={`p-4 rounded-xl ${kind === 'borrow' ? 'bg-amber-300/10 text-amber-300' : 'bg-sky-400/10 text-sky-400'}`}>
                  {kind === 'borrow' ? <LockIcon size={32} /> : <ZapIcon size={32} />}
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{kind === 'borrow' ? 'Borrow Item' : 'Challenge'}</div>
                  <div className="text-xl font-bold text-slate-100">{title}</div>
                </div>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">{kind === 'borrow' ? 'Collateral' : 'Reward'}</span>
                <span className="font-semibold text-slate-100 tnum">{amount} NIM</span>
              </div>
              <div className="py-2 text-sm text-slate-300 leading-relaxed">
                {description}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-950 border-t border-white/5">
        <button
          onClick={handleNext}
          disabled={step === 1 && !kind || step === 2 && (!title || !amount || !description)}
          className="w-full py-4 bg-amber-300 hover:bg-amber-400 text-slate-900 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === 3 ? 'Post Listing' : 'Next'}
          {step < 3 && <ChevronRightIcon size={20} />}
        </button>
      </div>
    </div>
  );
};

export default CreateListing;
