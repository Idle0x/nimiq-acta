"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ProfileCard from "./ProfileCard";

/** Public record modal for any address — trust legibility on tap. */
export default function ProfileSheet({ address, onClose }: { address: string | null; onClose: () => void }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!address) return;
    setData(null);
    fetch(`/api/profile/${address}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, [address]);

  if (!address) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/75 backdrop-blur-sm animate-fade-in sm:items-center" onClick={onClose}>
      <div className="floaty w-full max-w-[480px] rounded-t-3xl p-4 animate-slide-up sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <p className="caps text-[9px] text-[var(--gold)]">Public record</p>
          <button onClick={onClose} className="ghost rounded-full p-1.5"><X size={14} /></button>
        </div>
        {!data ? (
          <div className="space-y-2"><div className="skeleton h-20" /><div className="skeleton h-16" /></div>
        ) : (
          <ProfileCard {...data} />
        )}
      </div>
    </div>
  );
}
