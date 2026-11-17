import { useEffect, useRef } from 'react';

interface ECGProps {
  color?: string;
  height?: number;
  speed?: number;
  className?: string;
}

export function ECGWaveform({ color = '#10b981', height = 48, speed = 1, className = '' }: ECGProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function ecgY(x: number, mid: number): number {
      const t = x;
      let y = 0;
      y += 0.08 * Math.exp(-Math.pow((t - 0.12) / 0.03, 2));
      y -= 0.12 * Math.exp(-Math.pow((t - 0.22) / 0.008, 2));
      y += 0.55 * Math.exp(-Math.pow((t - 0.25) / 0.01, 2));
      y -= 0.28 * Math.exp(-Math.pow((t - 0.28) / 0.012, 2));
      y += 0.16 * Math.exp(-Math.pow((t - 0.45) / 0.05, 2));
      return mid - y * h * 0.7;
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const mid = h / 2;
      const cycleWidth = 120 * speed;
      const offset = phaseRef.current;

      ctx.strokeStyle = 'rgba(100, 116, 139, 0.12)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 12) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += 12) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.shadowColor = color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      const startX = -((offset % cycleWidth));
      for (let px = startX; px < w; px += 1) {
        const t = ((px + offset) % cycleWidth) / cycleWidth;
        const y = ecgY(t, mid);
        if (px === startX) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      phaseRef.current += 1.4 * speed;
      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [color, speed]);

  return <canvas ref={canvasRef} style={{ height, width: '100%' }} className={className} />;
}
