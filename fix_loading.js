const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

const loadingUi = `
      {/* UNIVERSAL WALLET FALLBACK OVERLAY */}
      
      {status === "loading" && (
        <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-pulse">
           <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-full flex items-center justify-center mb-6">
              <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
           </div>
           <h2 className="text-xl font-bold mb-2 text-white">Initializing Nimiq Pay</h2>
           <p className="text-slate-400 text-sm">Waiting for wallet injection...</p>
        </div>
      )}
`;

content = content.replace('{/* UNIVERSAL WALLET FALLBACK OVERLAY */}', loadingUi);

if (!content.includes('import { Loader2 }')) {
  // doesn't matter, we used css for the spinner above
}

fs.writeFileSync('app/page.tsx', content);
