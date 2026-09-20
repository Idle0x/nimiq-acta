'use client';
import React, { useEffect, useRef, useState } from 'react';
import { XIcon } from './icons';
import { Loader2, Upload, Camera } from 'lucide-react';

interface QrScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    let html5QrCodeInstance: any = null;

    const initScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        html5QrCodeInstance = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCodeInstance;

        await html5QrCodeInstance.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText: string) => {
            if (isStoppingRef.current) return;
            isStoppingRef.current = true;
            setVerifying(true);
            html5QrCodeInstance
              .stop()
              .catch(() => {})
              .finally(() => {
                onScan(decodedText);
              });
          },
          () => {
            // Frame scan failure is normal when no QR is visible in camera frame
          }
        );
      } catch (err: any) {
        console.warn('Camera direct stream initialization notice:', err);
        const msg = String(err?.message || err);
        if (msg.includes('NotAllowedError') || msg.includes('Permission') || msg.includes('denied')) {
          setError('Camera permission denied. Please allow camera access in your browser or Nimiq Pay settings, or upload a photo below.');
        } else {
          setError('Camera stream unavailable. You can take or upload a photo of the QR code below.');
        }
      }
    };

    initScanner();

    return () => {
      isStoppingRef.current = true;
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch {}
      }
    };
  }, [onScan]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVerifying(true);
    setError(null);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      let qr = scannerRef.current;
      if (!qr) {
        qr = new Html5Qrcode('qr-reader');
        scannerRef.current = qr;
      }
      const decodedText = await qr.scanFile(file, true);
      onScan(decodedText);
    } catch (err) {
      setVerifying(false);
      setError('No QR code detected in the uploaded photo. Please try a clearer photo or align the QR in frame.');
    }
  };

  return (
    <div className="app-ink fixed inset-0 z-[100] bg-black flex flex-col justify-between">
      {/* Direct video rendering canvas */}
      <div id="qr-reader" className={`absolute inset-0 w-full h-full overflow-hidden ${error ? 'opacity-30' : ''}`} />

      {/* Header bar */}
      <div className="relative z-20 bg-[var(--bg)]/75 backdrop-blur-xl p-4 flex items-center justify-between border-b border-[var(--line)]/10 pt-safe">
        <div>
          <h2 className="text-base font-bold text-[var(--ink)]">
            {verifying ? 'Verifying Proof…' : 'Scan QR Code'}
          </h2>
          <p className="text-[11px] text-[var(--ink3)]">Point camera at the counterparty or token QR code</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-[var(--ink3)] hover:text-[var(--ink)] bg-[var(--surface2)]/80 rounded-full transition-colors"
        >
          <XIcon size={20} />
        </button>
      </div>

      {/* Center viewfinder or error */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        {verifying ? (
          <div className="text-center flex flex-col items-center gap-3 p-6 bg-[var(--surface)]/90 rounded-2xl border border-[var(--gold)]/30 backdrop-blur-xl">
            <Loader2 className="w-9 h-9 animate-spin text-[var(--gold)]" />
            <p className="font-mono text-xs tracking-widest font-bold text-[var(--gold)]">
              PROCESSING SIGNATURE…
            </p>
          </div>
        ) : error ? (
          <div className="max-w-[320px] text-center p-5 bg-[var(--surface)]/95 rounded-2xl border border-[var(--wax)]/30 backdrop-blur-xl space-y-3 shadow-xl">
            <p className="text-xs text-[var(--wax)] font-semibold leading-relaxed">{error}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--gold)] text-[#181206] font-bold text-xs flex items-center justify-center gap-2 shadow-sm btn-press"
            >
              <Camera size={14} />
              <span>Capture / Upload QR Photo</span>
            </button>
          </div>
        ) : (
          <div className="relative w-[250px] h-[250px] pointer-events-none">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--gold)] rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--gold)] rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--gold)] rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--gold)] rounded-br-xl" />

            {/* Pulsing scanline */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--gold)] shadow-[0_0_12px_rgba(212,175,55,1)] animate-[scan_2s_ease-in-out_infinite]" />
          </div>
        )}
      </div>

      {/* Bottom Bar with Fallback File Input */}
      <div className="relative z-20 bg-[var(--bg)]/85 backdrop-blur-xl p-4 border-t border-[var(--line)]/10 pb-safe flex items-center justify-between gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--ink)] font-semibold text-xs flex items-center justify-center gap-2 border border-[var(--line)]/20 transition-all btn-press"
        >
          <Upload size={14} className="text-[var(--gold)]" />
          <span>Upload QR from Photo</span>
        </button>
        <button
          onClick={onClose}
          className="py-2.5 px-5 rounded-xl border border-[var(--line)]/20 text-[var(--ink3)] hover:text-[var(--ink)] font-semibold text-xs transition-colors"
        >
          Cancel
        </button>
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
      `}} />
    </div>
  );
};

export default QrScanner;
