'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface Props {
  value: string;
  size?: number;
}

export function QRCodeDisplay({ value, size = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: {
        dark: '#020408',
        light: '#00e5cc',
      },
    }).catch(() => null);
  }, [value, size]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-xl overflow-hidden p-2" style={{ background: '#00e5cc' }}>
        <canvas ref={canvasRef} width={size} height={size} />
      </div>
      <p className="text-[10px] text-[#4d7a90] text-center">Scan to view your RSVP</p>
    </div>
  );
}
