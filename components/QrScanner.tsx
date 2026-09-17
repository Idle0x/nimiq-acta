'use client';
import React, { useEffect, useRef, useState } from 'react';
import { XIcon } from './icons';

// Dynamically import the scanner to avoid SSR issues with browser APIs
let Html5QrcodeScanner: any = null;

interface QrScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

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
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        scanner.render(
          (decodedText: string) => {
            scanner.clear();
            onScan(decodedText);
          },
          (err: any) => {
            // Ignore ongoing scan errors
          }
        );
      } catch (err) {
        setError('Camera access denied or unavailable.');
      }
    };

    initScanner();

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur p-4 flex items-center justify-between border-b border-white/5 relative z-10">
        <h2 className="text-lg font-semibold text-slate-100">Scan Return QR</h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800 rounded-full">
          <XIcon size={20} />
        </button>
      </div>

      {/* Scanner Viewport */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {error ? (
          <div className="text-center p-6 text-rose-400">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div id="qr-reader" className="w-full max-w-sm overflow-hidden rounded-2xl border-2 border-amber-300/50" ref={scannerRef}></div>
            {/* Overlay scan line */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[250px] h-[250px] relative">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
        #qr-reader video {
          border-radius: 1rem;
          object-fit: cover;
        }
        #qr-reader__scan_region {
          background: #000;
        }
        #qr-reader__dashboard {
          display: none !important;
        }
      `}} />
    </div>
  );
};

export default QrScanner;
