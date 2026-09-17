const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Fix Trust Score logic
content = content.replace(
  'return Math.min(96, 42 + released * 18 + Math.min(12, escrows.length * 3));',
  'return Math.min(100, 0 + released * 18 + Math.min(25, escrows.length * 3));'
);

// 2. Insert Hub Fallback Overlay
const mainContentMarker = '{/* MAIN CONTENT AREA */}';
const fallbackUi = `
      {/* UNIVERSAL WALLET FALLBACK OVERLAY */}
      {status === "error" && !isConnected && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            <LockIcon size={28} className="text-slate-950" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Outside Nimiq Pay?</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-[280px]">
            Acta is a native Mini App designed for Nimiq Pay. Since you are in a standard browser, please connect using the universal Nimiq Hub to test the protocol.
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
            className="w-full max-w-[260px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl btn-press transition-colors"
          >
            Connect Nimiq Hub
          </button>
        </div>
      )}
      
      {/* MAIN CONTENT AREA */}
`;
content = content.replace(mainContentMarker, fallbackUi);

// 3. Inject HubApi import if missing
if (!content.includes('import HubApi')) {
  content = content.replace('import { useToast } from "@/components/Toast";', 'import { useToast } from "@/components/Toast";\nimport HubApi from "@nimiq/hub-api";');
}

// 4. Update the Radar Tab to include the Dashboard and the Horizontal/Vertical UI
// We will precisely slice out the old radar content and replace it.
const radarStart = '{/* RADAR TAB */}';
const activeStart = '{/* ACTIVE ESCROWS TAB */}';
const radarStartIdx = content.indexOf(radarStart);
const activeStartIdx = content.indexOf(activeStart);

if (radarStartIdx !== -1 && activeStartIdx !== -1) {
  const newRadar = `
          {/* RADAR TAB */}
          {tab === "radar" && (
            <div className="pb-10 animate-fade-in">
              {/* GLOBAL DASHBOARD */}
              {dashboard && (
                <div className="mb-8 grid grid-cols-2 gap-3">
                  <div className="card p-4 rounded-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-50" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">Total Value Locked</p>
                    <p className="text-2xl font-bold tnum text-white">{dashboard.stats.tvl_nim.toLocaleString()} NIM</p>
                    <p className="text-xs text-slate-400 mt-1">~$${'{(dashboard.stats.tvl_nim * dashboard.price).toFixed(2)}'} USD</p>
                  </div>
                  <div className="card p-4 rounded-2xl relative overflow-hidden group">
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
                {listings.filter(l => l.kind === "bounty").map(l => (
                  <div key={l.id} className="min-w-[280px] snap-center card-bounty p-5 rounded-2xl flex flex-col justify-between border border-amber-500/20">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full">{categoryBadge(l)}</span>
                        <div className="text-right">
                          <p className="text-lg font-bold tnum text-amber-400">{l.collateralNIM.toLocaleString()} NIM</p>
                          {dashboard && <p className="text-[10px] text-amber-400/70">~$${'{(l.collateralNIM * dashboard.price).toFixed(2)}'} USD</p>}
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
                ))}
              </div>

              <div className="flex items-center justify-between mb-4 mt-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <MapPinIcon size={14} className="text-blue-400" /> Available Nearby (Borrow)
                </h3>
              </div>
              
              <div className="space-y-4">
                {listings.filter(l => l.kind === "borrow").map((l) => (
                  <div key={l.id} className="card-borrow p-5 rounded-2xl border border-blue-500/20">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-full">{categoryBadge(l)}</span>
                      <div className="text-right">
                        <p className="text-lg font-bold tnum text-blue-400 flex items-center justify-end gap-1">
                          <LockIcon size={14} />
                          {l.collateralNIM.toLocaleString()} NIM
                        </p>
                        {dashboard && <p className="text-[10px] text-blue-400/70">~$${'{(l.collateralNIM * dashboard.price).toFixed(2)}'} USD</p>}
                      </div>
                    </div>
                    <h4 className="font-semibold text-lg leading-tight mb-2 text-white">{l.title}</h4>
                    <p className="text-xs text-slate-400 mb-4">{l.description}</p>
                    
                    <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl mb-5 border border-white/5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <span className="text-xs font-bold text-white">{(l.owner || 'A').charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Lender</p>
                        <p className="text-xs font-semibold text-white">{l.owner || 'Anonymous'}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] text-slate-400 uppercase tracking-wider">Yield req.</p>
                         <p className="text-xs font-bold text-emerald-400 tnum">+50 NIM</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setWizard(l)}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-sm transition-all btn-press shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    >
                      Review Smart Contract
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          `;
  
  content = content.slice(0, radarStartIdx) + newRadar + content.slice(activeStartIdx);
}

// 5. Update Active Tab Stepper (LOCKED -> RETURNED)
// Replace the generic status tags with a stepper.
content = content.replace(
  '{e.state.toUpperCase()}',
  `{e.state.toUpperCase()}
                      </span>
                    </div>

                    {/* STEPPER PROGRESS BAR */}
                    <div className="mt-4 mb-2 flex items-center justify-between relative">
                       <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
                       <div className={\`absolute top-1/2 left-0 h-0.5 -translate-y-1/2 z-0 transition-all duration-500 \${e.state === 'released' ? 'w-full bg-emerald-500' : 'w-1/2 bg-amber-500'}\`} />
                       
                       <div className="relative z-10 flex flex-col items-center gap-1">
                          <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center border-2 border-slate-950">
                            <CheckIcon size={10} className="text-slate-950" />
                          </div>
                          <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">Locked</span>
                       </div>
                       
                       <div className="relative z-10 flex flex-col items-center gap-1">
                          <div className={\`w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 \${e.state === 'released' ? 'bg-emerald-500' : 'bg-slate-800'}\`}>
                             {e.state === 'released' && <CheckIcon size={10} className="text-slate-950" />}
                          </div>
                          <span className={\`text-[9px] font-bold uppercase tracking-wider \${e.state === 'released' ? 'text-emerald-500' : 'text-slate-500'}\`}>Returned</span>
                       </div>
                    </div>`
);


fs.writeFileSync('app/page.tsx', content);
