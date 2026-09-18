import { MapPinIcon } from "lucide-react";

export function MapRadar({ listings }: { listings: any[] }) {
  // We'll generate pseudo-random coordinates based on listing ID to spread them on the map
  const getCoords = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = 10 + (Math.abs(hash) % 80); // 10% to 90%
    const y = 20 + (Math.abs(hash >> 8) % 60); // 20% to 80%
    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className="relative w-full aspect-[4/5] rounded-3xl bg-[var(--surface)] overflow-hidden border border-[var(--line)]/10 shadow-inner">
      {/* Grid Pattern */}
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2 }} />
      
      {/* Radar Scan Animation */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
         <div className="w-[150%] aspect-square rounded-full border border-[var(--sky)]/20 animate-ping" style={{ animationDuration: '4s' }} />
         <div className="absolute w-[100%] aspect-square rounded-full border border-[var(--sky)]/40 animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>

      <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-[var(--bg)] to-transparent z-10 pointer-events-none">
        <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--sky)]">Live Scanning</p>
        <p className="text-xs text-[var(--ink3)]">Found {listings.length} active bounties</p>
      </div>

      {/* Pins */}
      {listings.map((l) => (
        <div 
          key={l.id} 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
          style={getCoords(l.id)}
        >
          <div className="relative flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[var(--surface)] border-2 border-[var(--sky)] shadow-[0_0_15px_rgba(31,111,160,0.5)] flex items-center justify-center transition-transform hover:scale-110">
              <MapPinIcon size={14} className="text-[var(--sky)]" />
            </div>
            {/* Tooltip */}
            <div className="absolute top-10 whitespace-nowrap bg-[var(--surface)] border border-[var(--line)]/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-30">
              <p className="text-xs font-bold text-[var(--ink)] max-w-[150px] truncate">{l.title}</p>
              <p className="text-[10px] text-[var(--gold)]">{l.collateralNIM} NIM</p>
            </div>
          </div>
        </div>
      ))}
      
      <div className="absolute bottom-4 right-4 bg-[var(--surface)]/80 backdrop-blur border border-[var(--line)]/10 px-3 py-1.5 rounded-full z-10 pointer-events-none">
         <p className="text-[10px] font-mono text-[var(--ink3)]">LAT/LNG LINK SECURE</p>
      </div>
    </div>
  );
}
