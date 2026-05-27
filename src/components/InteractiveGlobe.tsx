import React, { useEffect, useRef, useState } from 'react';

interface CountryNode {
  name: string;
  lat: number;
  lon: number;
  active: boolean;
  offsetX?: number;
  offsetY?: number;
}

// Static avatar positions (as angle in radians around the globe, and distance from center)
interface StaticAvatar {
  imageSrc: string;
  glowColor: string;
  angle: number;      // position around the clock (radians)
  distance: number;   // distance from globe center in px
}

export const InteractiveGlobe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Globe settings — DOUBLED
  const R = 330; // Radius of the globe (was 180)
  const rotation = useRef({ x: 0.15, y: -0.8 }); // initial rotation angles
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const autoSpinSpeed = useRef(0.003);
  const lastTime = useRef(performance.now());
  const animationFrameId = useRef<number | null>(null);

  // Geographic dots database (pre-computed XYZ)
  const [geoDots, setGeoDots] = useState<{ x: number; y: number; z: number }[]>([]);

  // Active and inactive country markers
  const countries: CountryNode[] = [
    { name: 'PERÚ',        lat: -9.19,  lon: -75.01, active: true,  offsetX: -55, offsetY:   0 },
    { name: 'ARGENTINA',   lat: -38.41, lon: -63.61, active: true,  offsetX:  55, offsetY:  20 },
    { name: 'EEUU',        lat: 37.09,  lon: -95.71, active: false, offsetX:  20, offsetY: -22 },
    { name: 'MÉXICO',      lat: 23.63,  lon: -102.55,active: false, offsetX: -50, offsetY: -18 },
    { name: 'COLOMBIA',    lat:  4.57,  lon: -74.30, active: false, offsetX:  55, offsetY:   0 },
    { name: 'ECUADOR',     lat: -1.83,  lon: -78.18, active: false, offsetX: -55, offsetY:   5 },
    { name: 'BOLIVIA',     lat: -16.29, lon: -63.58, active: false, offsetX:  55, offsetY:   5 },
    { name: 'CHILE',       lat: -35.67, lon: -71.54, active: false, offsetX: -50, offsetY:  18 },
    { name: 'URUGUAY',     lat: -32.52, lon: -55.76, active: false, offsetX:  55, offsetY:  12 },
    { name: 'PARAGUAY',    lat: -23.44, lon: -58.44, active: false, offsetX:  55, offsetY:   0 },
    { name: 'VENEZUELA',   lat:  6.42,  lon: -66.58, active: false, offsetX:  55, offsetY: -14 },
    { name: 'R. DOMINICANA', lat: 18.73, lon: -70.16, active: false, offsetX: 65, offsetY: -18 },
    { name: 'GUATEMALA',   lat: 15.78,  lon: -90.23, active: false, offsetX: -55, offsetY:  -5 },
    { name: 'COSTA RICA',  lat:  9.74,  lon: -83.75, active: false, offsetX: -55, offsetY:   8 },
    { name: 'PANAMÁ',      lat:  8.53,  lon: -80.78, active: false, offsetX:  48, offsetY:  -5 },
  ];

  // Static avatars placed at fixed positions around the globe edge
  const avatarPositions: StaticAvatar[] = [
    { imageSrc: '/avatar_peru.png',      glowColor: '#00FF66', angle: -2.35, distance: 430 }, // top-left
    { imageSrc: '/avatar_argentina.png', glowColor: '#00FF66', angle: -0.80, distance: 450 }, // top-right
    { imageSrc: '/super_agent_avatar.png', glowColor: '#00C2FF', angle: 2.60, distance: 440 }, // bottom-left
    { imageSrc: '/avatar_peru.png',      glowColor: '#FF5500', angle: -0.10, distance: 420 }, // right
    { imageSrc: '/avatar_argentina.png', glowColor: '#00FF66', angle: 2.00, distance: 430 }, // bottom-right
    { imageSrc: '/super_agent_avatar.png', glowColor: '#FF5500', angle: -3.00, distance: 460 }, // left
  ];

  const avatarImages = useRef<Record<string, HTMLImageElement>>({});

  // Helper: lat/lon → pre-computed XYZ on sphere of radius R
  const latLonToXYZ = (lat: number, lon: number, r: number) => {
    const theta = (lat * Math.PI) / 180;
    const phi   = (lon * Math.PI) / 180;
    return {
      x: r * Math.cos(theta) * Math.sin(phi),
      y: r * Math.sin(theta),
      z: r * Math.cos(theta) * Math.cos(phi),
    };
  };

  // Fallback mathematical continent generator
  const generateFallbackDots = () => {
    const dots: { x: number; y: number; z: number }[] = [];
    const step = 4;
    for (let lat = -58; lat <= 78; lat += step) {
      for (let lon = -180; lon <= 180; lon += step) {
        let isLand = false;
        if (lat >= 12 && lat <= 75 && lon >= -168 && lon <= -52) isLand = true;
        else if (lat >= -56 && lat < 12  && lon >= -82  && lon <= -34) isLand = true;
        else if (lat >= -35 && lat < 36  && lon >= -18  && lon <= 51)  isLand = true;
        else if (lat >= 10  && lat <= 75 && lon >= -10  && lon <= 180) isLand = true;
        else if (lat >= -40 && lat <= -10 && lon >= 113 && lon <= 153) isLand = true;
        if (isLand) dots.push(latLonToXYZ(lat, lon, R));
      }
    }
    return dots;
  };

  useEffect(() => {
    // Load world map image → pre-compute XYZ dots
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const offscreen = document.createElement('canvas');
        offscreen.width  = 360 * 0.4;
        offscreen.height = 180 * 0.4;
        const ctx = offscreen.getContext('2d');
        if (!ctx) { setGeoDots(generateFallbackDots()); return; }
        ctx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
        const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
        const parsed: { x: number; y: number; z: number }[] = [];
        for (let y = 0; y < offscreen.height; y++) {
          const lat = 90 - (y / offscreen.height) * 180;
          if (lat < -58 || lat > 78) continue;
          for (let x = 0; x < offscreen.width; x++) {
            if (imgData.data[(y * offscreen.width + x) * 4] > 150 && x % 3 === 0 && y % 3 === 0) {
              parsed.push(latLonToXYZ(lat, (x / offscreen.width) * 360 - 180, R));
            }
          }
        }
        setGeoDots(parsed.length > 0 ? parsed : generateFallbackDots());
      } catch { setGeoDots(generateFallbackDots()); }
    };
    img.onerror = () => setGeoDots(generateFallbackDots());
    img.src = '/world_map.png';

    // Pre-load avatars
    avatarPositions.forEach(av => {
      if (!avatarImages.current[av.imageSrc]) {
        const i = new Image();
        i.src = av.imageSrc;
        i.onload = () => { avatarImages.current[av.imageSrc] = i; };
      }
    });

    return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Projection helper (for country markers, uses lat/lon on the fly)
  const project = (lat: number, lon: number, r: number, rotX: number, rotY: number) => {
    const theta = (lat * Math.PI) / 180;
    const phi   = (lon * Math.PI) / 180;
    const x = r * Math.cos(theta) * Math.sin(phi);
    const y = r * Math.sin(theta);
    const z = r * Math.cos(theta) * Math.cos(phi);
    const x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
    const z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
    const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
    const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
    return { x: x1, y: y2, z: z2 };
  };

  // Draw a circular avatar with glow border
  const drawAvatar = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    av: StaticAvatar,
    size: number
  ) => {
    ctx.save();
    // Glow ring
    ctx.shadowBlur = 14;
    ctx.shadowColor = av.glowColor;
    ctx.beginPath();
    ctx.arc(x, y, size / 2 + 3, 0, Math.PI * 2);
    ctx.fillStyle = av.glowColor;
    ctx.fill();
    ctx.shadowBlur = 0;
    // White ring
    ctx.beginPath();
    ctx.arc(x, y, size / 2 + 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Clip & draw image
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.clip();
    const img = avatarImages.current[av.imageSrc];
    if (img) {
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${size * 0.3}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👤', x, y);
    }
    ctx.restore();
  };

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    let lastFrameTime = 0;
    const FRAME_INTERVAL = 1000 / 40; // 40 fps

    const render = (timestamp: number) => {
      animationFrameId.current = requestAnimationFrame(render);
      if (!isVisible) return;
      const delta = timestamp - lastFrameTime;
      if (delta < FRAME_INTERVAL) return;
      lastFrameTime = timestamp - (delta % FRAME_INTERVAL);

      const time = performance.now();
      lastTime.current = time;

      if (!isDragging.current) rotation.current.y += autoSpinSpeed.current;
      const rotY = rotation.current.y;
      const rotX = rotation.current.x;

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      // Clear canvas (transparent background)
      ctx.clearRect(0, 0, W, H);

      // ─── Atmosphere outer glow ───
      const atmo = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.18);
      atmo.addColorStop(0, 'rgba(0, 180, 255, 0.06)');
      atmo.addColorStop(0.5, 'rgba(0, 80, 200, 0.03)');
      atmo.addColorStop(1, 'rgba(5, 5, 8, 0)');
      ctx.fillStyle = atmo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // ─── Globe sphere base ───
      const sphereGrad = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, R * 0.05, cx, cy, R);
      sphereGrad.addColorStop(0,   'rgba(18, 26, 52, 0.95)');
      sphereGrad.addColorStop(0.7, 'rgba(8, 12, 28, 0.97)');
      sphereGrad.addColorStop(1,   'rgba(0, 194, 255, 0.08)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // Globe edge ring
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 194, 255, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ─── Precompute rotation trig ───
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      // ─── Geo dots (white/gray — continents) ───
      // Back dots
      ctx.fillStyle = 'rgba(180, 200, 230, 0.06)';
      ctx.beginPath();
      geoDots.forEach(dot => {
        const x1 = dot.x * cosY - dot.z * sinY;
        const z1 = dot.x * sinY + dot.z * cosY;
        const y2 = dot.y * cosX - z1 * sinX;
        const z2 = dot.y * sinX + z1 * cosX;
        if (z2 < 0) {
          ctx.moveTo(cx + x1 + 1.5, cy + y2);
          ctx.arc(cx + x1, cy + y2, 1.5, 0, Math.PI * 2);
        }
      });
      ctx.fill();

      // Front dots — white/light blue
      ctx.fillStyle = 'rgba(180, 210, 255, 0.55)';
      ctx.beginPath();
      geoDots.forEach(dot => {
        const x1 = dot.x * cosY - dot.z * sinY;
        const z1 = dot.x * sinY + dot.z * cosY;
        const y2 = dot.y * cosX - z1 * sinX;
        const z2 = dot.y * sinX + z1 * cosX;
        if (z2 >= 0) {
          ctx.moveTo(cx + x1 + 1.8, cy + y2);
          ctx.arc(cx + x1, cy + y2, 1.8, 0, Math.PI * 2);
        }
      });
      ctx.fill();

      // ─── Country markers & labels ───
      countries.forEach(country => {
        const proj = project(country.lat, country.lon, R + 3, rotX, rotY);
        if (proj.z < 0) return; // behind globe

        const px = cx + proj.x;
        const py = cy + proj.y;
        const pulse = 1 + Math.sin(time * 0.006) * 0.3;

        if (country.active) {
          // Outer pulse glow
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#00FF66';
          ctx.beginPath();
          ctx.arc(px, py, 8 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 255, 102, 0.25)';
          ctx.fill();
          ctx.shadowBlur = 0;
          // Inner bright dot
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#00FF66';
          ctx.fill();
          // White center
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        } else {
          // Inactive: small green dot (matching reference)
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 255, 102, 0.7)';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#00FF66';
          ctx.fill();
        }

        // Label
        const lx = px + (country.offsetX || 0);
        const ly = py + (country.offsetY || (country.lat > 0 ? -22 : 22));
        const text = country.name;
        ctx.font = `bold 10px "Space Grotesk", sans-serif`;
        const tw = ctx.measureText(text).width;
        const px2 = 8, py2 = 5;
        const bw = tw + px2 * 2, bh = 18 + py2 * 2;

        // Box bg
        ctx.fillStyle = 'rgba(5, 5, 12, 0.88)';
        ctx.beginPath();
        ctx.roundRect(lx - bw / 2, ly - bh / 2, bw, bh, 4);
        ctx.fill();

        // Box border
        ctx.lineWidth = 1.2;
        if (country.active) {
          ctx.strokeStyle = '#00FF66';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00FF66';
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.12)';
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Text
        ctx.fillStyle = country.active ? '#FFFFFF' : 'rgba(200,220,255,0.55)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, lx, ly);
      });

      // ─── Static avatars around globe border ───
      avatarPositions.forEach(av => {
        const x = cx + Math.cos(av.angle) * av.distance;
        const y = cy + Math.sin(av.angle) * av.distance;
        drawAvatar(ctx, x, y, av, 62);
      });
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      observer.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoDots]);

  // ─── Drag handlers ───
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - previousMousePosition.current.x;
    const dy = e.clientY - previousMousePosition.current.y;
    rotation.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotation.current.x - dy * 0.005));
    rotation.current.y -= dx * 0.005;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => { isDragging.current = false; };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - previousMousePosition.current.x;
    const dy = e.touches[0].clientY - previousMousePosition.current.y;
    rotation.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotation.current.x - dy * 0.005));
    rotation.current.y -= dx * 0.005;
    previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => { isDragging.current = false; };

  return (
    <div style={{ position: 'relative', display: 'inline-block', cursor: isDragging.current ? 'grabbing' : 'grab', width: '100%', maxWidth: '1100px' }}>
      <canvas
        ref={canvasRef}
        width={1100}
        height={780}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          margin: '0 auto',
          borderRadius: '12px',
        }}
      />
    </div>
  );
};
