import * as fs from "fs";

let page = fs.readFileSync("app/page.tsx", "utf-8");

page = page.replace(
  /<div key={l.id} className="min-w-\[280px\] snap-center card-bounty p-4 rounded-2xl flex flex-col justify-between border border-amber-500\/20">[\s\S]*?<div className="flex gap-2">/g,
  `<div key={l.id} className="min-w-[260px] snap-center card-bounty p-3 rounded-xl flex flex-col justify-between border border-amber-500/20">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm leading-tight text-white truncate max-w-[140px]">{l.title}</h4>
                          <div className="text-right">
                            <p className="text-sm font-bold tnum text-amber-400">{l.collateralNIM.toLocaleString()} NIM</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">`
);

// We need to also shrink the buttons inside bounties
page = page.replace(
  /className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-sm transition-all btn-press shadow-\[0_0_15px_rgba\(56,189,248,0\.2\)\]"/g,
  `className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition-all btn-press"`
);
page = page.replace(
  /className="w-full py-3 bg-slate-800 text-slate-500 font-bold rounded-xl text-sm cursor-not-allowed"/g,
  `className="w-full py-2 bg-slate-800 text-slate-500 font-bold rounded-lg text-xs cursor-not-allowed"`
);
page = page.replace(
  /className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all btn-press shadow-\[0_0_15px_rgba\(251,191,36,0\.2\)\]"/g,
  `className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all btn-press"`
);

// Borrow cards
page = page.replace(
  /<div key={l.id} className="card-borrow p-4 rounded-2xl border border-blue-500\/20">[\s\S]*?<button\s+onClick=\{\(\) => setWizard\(l\)\}/g,
  `<div key={l.id} className="card-borrow p-3 rounded-xl border border-blue-500/20">
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
                        onClick={() => setWizard(l)}`
);

page = page.replace(
  /className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-sm transition-all btn-press shadow-\[0_0_15px_rgba\(59,130,246,0\.3\)\]"/g,
  `className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg text-xs transition-all btn-press"`
);

// Escrow cards (Active tab)
page = page.replace(
  /<div key={e.id} className="card p-4 rounded-2xl">[\s\S]*?<p className="tnum mt-2 text-2xl font-extrabold text-white">[\s\S]*?<div className="mt-2 flex items-center gap-3/g,
  `<div key={e.id} className="card p-3 rounded-xl mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-white">{e.title}</h4>
                        <p className="tnum mt-0.5 text-lg font-extrabold text-white">
                          {e.amountNIM.toLocaleString()} <span className="text-xs text-slate-400">NIM</span>
                        </p>
                      </div>
                      <span className={\`rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase \${
                          e.state === "locked" ? "bg-amber-300/15 text-amber-300" : "bg-emerald-400/15 text-emerald-300"
                        }\`}>
                        {e.state}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-3`
);

// Delete the cancel/refund button large padding and shrink it
page = page.replace(
  /className="mt-2 w-full py-2 bg-rose-500\/10 border border-rose-500\/20 text-rose-400 rounded-lg text-xs font-bold hover:bg-rose-500\/20"/g,
  `className="mt-2 w-full py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-md text-[10px] uppercase font-bold hover:bg-rose-500/20"`
);


fs.writeFileSync("app/page.tsx", page);
