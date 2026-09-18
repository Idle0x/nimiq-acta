'use client';
import React, { useEffect, useRef, useState } from 'react';
import { XIcon } from './icons';
import { Loader2 } from 'lucide-react';

let Html5QrcodeScanner: any = null;

interface QrScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    let scanner: any = null;

    const initScanner = async () => {
      try {
        if (!Html5QrcodeScanner) {
          const mod = await import('html5-qrcode');
          Html5QrcodeScanner = mod.Html5QrcodeScanner;
        }

        scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          false
        );
        scannerRef.current = scanner;

        scanner.render(
          (decodedText: string) => {
            setVerifying(true);
            scanner.clear();
            onScan(decodedText);
          },
          (err: any) => {
            if (err?.name === "NotAllowedError") {
              setError('Camera access denied. Please enable permissions.');
              scanner.clear();
            }
          }
        );
      } catch (err: any) {
        if (err?.name === "NotAllowedError") {
            setError('Camera access denied. Please enable permissions.');
        } else {
            setError('Camera unavailable.');
        }
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="app-ink fixed inset-0 z-[100] bg-black">
      {/* Full bleed camera container */}
      <div id="qr-reader" className={`absolute inset-0 w-full h-full ${error || verifying ? 'hidden' : ''}`} />
      
      {/* Glassmorphic overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col">
        {/* Header (blurred obsidian frame) */}
        <div className="bg-[var(--bg)]/60 backdrop-blur-xl p-4 flex items-center justify-between border-b border-[var(--line)]/5 pointer-events-auto pt-safe">
          <h2 className="text-lg font-semibold text-[var(--ink)]">{verifying ? "Verifying..." : "Scan Return QR"}</h2>
          <button onClick={onClose} className="p-2 text-[var(--ink3)] hover:text-[var(--ink)] bg-[var(--surface2)]/50 rounded-full transition-colors">
            <XIcon size={20} />
          </button>
        </div>

        {/* Center cutout */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-[var(--bg)]/60 backdrop-blur-[2px]" style={{ maskImage: 'radial-gradient(circle at center, transparent 35%, black 45%)', WebkitMaskImage: 'radial-gradient(circle at center, transparent 35%, black 45%)' }} />
          
          {error ? (
            <div className="relative z-10 text-center p-6 text-[var(--wax)] bg-[var(--surface)]/90 rounded-2xl border border-[var(--wax)]/20 backdrop-blur-xl pointer-events-auto">
              <p className="font-semibold">{error}</p>
            </div>
          ) : verifying ? (
            <div className="relative z-10 text-center flex flex-col items-center gap-4 text-[var(--gold)]">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-mono text-sm tracking-widest font-bold">VERIFYING SIGNATURE</p>
            </div>
          ) : (
            <div className="relative w-[260px] h-[260px] z-10">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--gold)] rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--gold)] rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--gold)] rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--gold)] rounded-br-xl" />
              
              {/* Scanline */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--gold)] shadow-[0_0_12px_rgba(154,116,24,1)] animate-[scan_2s_ease-in-out_infinite]" />
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0%, 100% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          50% { top: 100%; opacity: 1; }
          90% { opacity: 0; }
        }
        #qr-reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
        #qr-reader__scan_region {
          height: 100% !important;
        }
        #qr-reader__dashboard {
          display: none !important;
        }
      `}} />
    </div>
  );
};

export default QrScanner;
