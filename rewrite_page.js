const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

const dashboardState = `
  const [dashboard, setDashboard] = useState<{price: number, stats: any} | null>(null);
  
  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => {
      if(d.price) setDashboard(d);
    }).catch(console.error);
  }, []);
`;

content = content.replace('const [isMounted, setIsMounted] = useState(false);', 'const [isMounted, setIsMounted] = useState(false);' + dashboardState);

const newRadarTab = `
              {/* GLOBAL DASHBOARD */}
              {dashboard && (
                <div className="mb-8 grid grid-cols-2 gap-3 animate-fade-in">
                  <div className="card p-4 rounded-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-50" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">Total Value Locked</p>
                    <p className="text-2xl font-bold tnum">{dashboard.stats.tvl_nim.toLocaleString()} NIM</p>
                    <p className="text-xs text-slate-400 mt-1">~\\${(dashboard.stats.tvl_nim * dashboard.price).toFixed(2)} USD</p>
                  </div>
                  <div className="card p-4 rounded-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-50" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">30-Day Volume</p>
                    <p className="text-2xl font-bold tnum">{dashboard.stats.volume_30d.toLocaleString()} NIM</p>
                    <p className="text-xs text-slate-400 mt-1">{dashboard.stats.escrows_30d} contracts executed</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">🔥 Earn NIM (Bounties)</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 mb-4 no-scrollbar snap-x">
                {listings.filter(l => l.kind === "bounty").map(l => (
                  <div key={l.id} className="min-w-[280px] snap-center card-bounty p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">{l.category}</span>
                        <div className="text-right">
                          <p className="text-lg font-bold tnum text-amber-400">{l.collateralNIM.toLocaleString()} NIM</p>
                          {dashboard && <p className="text-[10px] text-amber-400/70">~\\${(l.collateralNIM * dashboard.price).toFixed(2)} USD</p>}
                        </div>
                      </div>
                      <h4 className="font-semibold text-lg leading-tight mb-1">{l.title}</h4>
                      <p className="text-xs text-slate-400 mb-4 line-clamp-2">{l.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedItem(l)}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all btn-press"
                    >
                      Accept Bounty
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4 mt-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">🛠️ Available Nearby (Borrow)</h3>
              </div>
              <div className="space-y-4">
                {listings.filter(l => l.kind === "borrow").map((l) => (
                  <div key={l.id} className="card-borrow p-5 rounded-2xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">{l.category}</span>
                      <div className="text-right">
                        <p className="text-lg font-bold tnum text-blue-400">
                          <LockIcon size={12} className="inline mr-1 -mt-0.5" />
                          {l.collateralNIM.toLocaleString()} NIM
                        </p>
                        {dashboard && <p className="text-[10px] text-blue-400/70">~\\${(l.collateralNIM * dashboard.price).toFixed(2)} USD</p>}
                      </div>
                    </div>
                    <h4 className="font-semibold text-lg leading-tight mb-1">{l.title}</h4>
                    <p className="text-xs text-slate-400 mb-3">{l.description}</p>
                    
                    {/* Peer-to-Peer Profile Preview */}
                    <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl mb-4 border border-white/5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <span className="text-xs font-bold">{l.owner.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-300">Lender: <span className="font-semibold text-white">{l.owner}</span></p>
                        <p className="text-[10px] text-emerald-400">Top Rated · 150+ completed</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] text-slate-400">Yield req.</p>
                         <p className="text-xs font-bold text-white tnum">+50 NIM</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedItem(l)}
                      className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-sm transition-all btn-press"
                    >
                      Review Smart Contract
                    </button>
                  </div>
                ))}
              </div>
`;

const radarRegex = /\{\/\* RADAR TAB \*\/\}\s*<div className="space-y-4">\s*<div className="flex items-center justify-between mb-4">[\s\S]*?(?=\{\/\* ACTIVE ESCROWS TAB \*\/\})/m;

content = content.replace(radarRegex, '{/* RADAR TAB */}\n<div className="pb-10">\n' + newRadarTab + '\n</div>\n\n');

fs.writeFileSync('app/page.tsx', content);
