'use client';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

interface ScannerProps {
  onScan: (decodedText: string) => void;
}

export default function Scanner({ onScan }: ScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Initialize the scanner
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const config = { 
      fps: 10, 
      qrbox: { width: 300, height: 150 }, // Rectangular box for barcodes
      aspectRatio: 1.0
    };

    // Start scanning automatically with the rear camera
    html5QrCode.start(
      { facingMode: "environment" }, // Prefer rear camera
      config,
      (decodedText) => {
        onScan(decodedText);
        // Optional: Stop scanning after successful scan if desired
        // html5QrCode.stop().catch(err => console.error(err));
      },
      (errorMessage) => {
        // Parse error, ignore for UI noise
      }
    ).catch(err => {
      console.error("Error starting scanner:", err);
      setError('No se pudo iniciar la cámara. Asegúrate de dar permisos.');
    });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="w-full max-w-sm mx-auto">
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div id="reader" className="w-full overflow-hidden rounded-lg"></div>
      <p className="text-center text-sm text-gray-500 mt-2">
        Apunta la cámara al código de barras
      </p>
    </div>
  );
}
