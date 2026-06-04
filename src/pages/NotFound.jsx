import { useEffect, useRef, useState } from "react";
import "../style/NotFound.css";

export default function NotFound() {
  const canvasRef = useRef(null);
  const [glitchActive, setGlitchActive] = useState(false);

  /* ── Particle canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const PARTICLE_COUNT = 80;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.3,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,176,64,${p.alpha})`;
        ctx.fill();
      });

      /* Draw connection lines */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(251,176,64,${0.07 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ── Glitch pulse ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 300);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="nf-root">
      <canvas ref={canvasRef} className="nf-canvas" />

      {/* Radial glow behind 404 */}
      <div className="nf-glow" />

      <main className="nf-content">
        {/* Eyebrow label */}
        <p className="nf-eyebrow">
          <span className="nf-dot" />
          Error · Page not found
        </p>

        {/* Giant 404 */}
        <div className={`nf-hero ${glitchActive ? "nf-hero--glitch" : ""}`}>
          <span className="nf-hero__text" aria-hidden="true" data-text="404">404</span>
          <span className="nf-hero__outline" aria-hidden="true">404</span>
        </div>

        {/* Divider line */}
        <div className="nf-divider">
          <span className="nf-divider__line" />
          <span className="nf-divider__icon">✦</span>
          <span className="nf-divider__line" />
        </div>

        {/* Copy */}
        <h1 className="nf-title">Lost in the void</h1>
        <p className="nf-body">
          The page you're chasing doesn't exist here — it may have moved,
          been deleted, or never existed at all.
        </p>

        {/* CTA buttons */}
        <div className="nf-actions">
          <a href="/" className="nf-btn nf-btn--primary">
            <span className="nf-btn__label">Back to Home</span>
            <span className="nf-btn__arrow">→</span>
          </a>
          <a href="/#projects" className="nf-btn nf-btn--ghost">
            View Projects
          </a>
        </div>

        {/* Footer hint */}
        <p className="nf-hint">
          Or try the <a href="/#contact" className="nf-link">contact page</a> if something's broken.
        </p>
      </main>

      {/* Decorative corner marks */}
      <span className="nf-corner nf-corner--tl" />
      <span className="nf-corner nf-corner--tr" />
      <span className="nf-corner nf-corner--bl" />
      <span className="nf-corner nf-corner--br" />
    </div>
  );
}