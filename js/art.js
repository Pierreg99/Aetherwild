(function (root) {
  function mul(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hsl(h, s, l) { return 'hsl(' + h + ' ' + s + '% ' + l + '%)'; }

  function palette(seed) {
    const r = mul(seed);
    const hue = Math.floor(r() * 360);
    return [hsl(hue, 42, 38), hsl((hue + 18) % 360, 58, 64), hsl((hue + 200) % 360, 28, 22), hsl(hue, 75, 82)];
  }

  function reduced() {
    return root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function drawResonant(ctx, sp, x, y, size, time) {
    const pal = palette(sp.artSeed || 1);
    const r = mul(sp.artSeed || 1);
    const wob = reduced() ? 0 : Math.sin(time / 420 + (sp.artSeed % 7)) * size * 0.05;
    ctx.save();
    ctx.translate(x, y + wob);
    ctx.fillStyle = pal[2];
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.46, size * 0.42, size * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    const plan = sp.plan;
    if (plan === 'crystalline') crystal(ctx, size, pal, r);
    else if (plan === 'orbiting') orbit(ctx, size, pal, time);
    else if (plan === 'tidal') tidal(ctx, size, pal);
    else if (plan === 'laminar') laminar(ctx, size, pal);
    else if (plan === 'geomorphic') mesa(ctx, size, pal);
    else if (plan === 'lattice') lattice(ctx, size, pal);
    else if (plan === 'filament') filament(ctx, size, pal, r);
    else if (plan === 'bloom') bloom(ctx, size, pal);
    else if (plan === 'porous') porous(ctx, size, pal);
    else if (plan === 'colonial') colonial(ctx, size, pal);
    else coil(ctx, size, pal);
    ctx.restore();
  }

  function crystal(ctx, s, pal) {
    ctx.fillStyle = pal[0];
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.46);
    ctx.lineTo(s * 0.28, -s * 0.05);
    ctx.lineTo(s * 0.16, s * 0.4);
    ctx.lineTo(-s * 0.18, s * 0.38);
    ctx.lineTo(-s * 0.3, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = pal[1];
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.28);
    ctx.lineTo(s * 0.1, s * 0.08);
    ctx.lineTo(-s * 0.08, s * 0.12);
    ctx.closePath();
    ctx.fill();
  }

  function orbit(ctx, s, pal, time) {
    ctx.fillStyle = pal[0];
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = pal[1];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.38, s * 0.16, 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.22, s * 0.4, -0.6, 0, Math.PI * 2);
    ctx.stroke();
    const a = reduced() ? 0.6 : time / 500;
    ctx.fillStyle = pal[3];
    ctx.beginPath();
    ctx.arc(Math.cos(a) * s * 0.38, Math.sin(a) * s * 0.16, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }

  function tidal(ctx, s, pal) {
    ctx.strokeStyle = pal[1];
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const y = -s * 0.28 + i * s * 0.16;
      ctx.moveTo(-s * 0.4, y);
      ctx.quadraticCurveTo(0, y + (i % 2 ? s * 0.12 : -s * 0.12), s * 0.4, y);
      ctx.stroke();
    }
    ctx.fillStyle = pal[0];
    ctx.fillRect(-s * 0.08, -s * 0.08, s * 0.16, s * 0.16);
  }

  function laminar(ctx, s, pal) {
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 ? pal[1] : pal[0];
      const w = s * (0.7 - i * 0.08);
      ctx.fillRect(-w / 2, -s * 0.36 + i * s * 0.14, w, s * 0.1);
    }
  }

  function mesa(ctx, s, pal) {
    ctx.fillStyle = pal[0];
    ctx.fillRect(-s * 0.36, -s * 0.05, s * 0.72, s * 0.42);
    ctx.fillStyle = pal[1];
    ctx.fillRect(-s * 0.22, -s * 0.32, s * 0.44, s * 0.28);
    ctx.fillStyle = pal[3];
    ctx.fillRect(-s * 0.05, -s * 0.18, s * 0.08, s * 0.16);
  }

  function lattice(ctx, s, pal) {
    ctx.strokeStyle = pal[1];
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.34, i * s * 0.16);
      ctx.lineTo(s * 0.34, i * s * 0.16);
      ctx.moveTo(i * s * 0.16, -s * 0.34);
      ctx.lineTo(i * s * 0.16, s * 0.34);
      ctx.stroke();
    }
    ctx.fillStyle = pal[3];
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
  }

  function filament(ctx, s, pal) {
    ctx.strokeStyle = pal[1];
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const ang = i * Math.PI / 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(Math.cos(ang + 0.6) * s * 0.2, Math.sin(ang + 0.6) * s * 0.2, Math.cos(ang) * s * 0.42, Math.sin(ang) * s * 0.42);
      ctx.stroke();
    }
    ctx.fillStyle = pal[0];
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  function coil(ctx, s, pal) {
    ctx.strokeStyle = pal[1];
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const ang = t * Math.PI * 4;
      const rad = t * s * 0.4;
      const x = Math.cos(ang) * rad;
      const y = Math.sin(ang) * rad * 0.72;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = pal[3];
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTile(ctx, ch, x, y, tile) {
    const base = {
      '#': '#101a16', '.': '#1c3a30', g: '#1e6a3c', H: '#245c40',
      S: '#6a4030', N: '#1d4454', D: '#3c4424', e: '#1c3a30', '~': '#164a58'
    };
    ctx.fillStyle = base[ch] || '#1c3a30';
    ctx.fillRect(x, y, tile, tile);
    if (ch === '#') {
      ctx.fillStyle = '#24362e';
      ctx.fillRect(x, y, tile, 4);
    } else if (ch === 'g') {
      ctx.fillStyle = '#8ee07a';
      ctx.fillRect(x + 3, y + 9, 2, 5);
      ctx.fillRect(x + 8, y + 7, 2, 7);
      ctx.fillRect(x + 12, y + 10, 2, 4);
    } else if (ch === 'H') {
      ctx.fillStyle = '#e6c56e';
      ctx.fillRect(x + 7, y + 3, 2, 10);
      ctx.fillRect(x + 4, y + 6, 8, 2);
    } else if (ch === 'S') {
      ctx.fillStyle = '#e6c56e';
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 14);
      ctx.lineTo(x + 8, y + 3);
      ctx.lineTo(x + 14, y + 14);
      ctx.fill();
    } else if (ch === 'P') {
      ctx.fillStyle = '#8a5a32';
      ctx.fillRect(x + 2, y + 8, 12, 6);
      ctx.fillStyle = '#e6c56e';
      ctx.fillRect(x + 4, y + 4, 8, 4);
    } else if (ch === 'N') {
      ctx.fillStyle = '#d5e4ef';
      ctx.beginPath();
      ctx.arc(x + 8, y + 6, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x + 6, y + 9, 4, 5);
    } else if (ch === 'C') {
      ctx.fillStyle = '#e6c56e';
      ctx.beginPath();
      ctx.arc(x + 8, y + 8, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (ch === 'D' || ch === 'B') {
      ctx.strokeStyle = '#e6c56e';
      ctx.strokeRect(x + 3.5, y + 3.5, 9, 10);
    } else if (ch === 'e' || ch === 'r') {
      ctx.fillStyle = '#1c3a30';
      ctx.fillRect(x, y, tile, tile);
      ctx.fillStyle = '#e6c56e';
      ctx.fillRect(x + 7, y + 7, 2, 2);
    }
  }

  function bloom(ctx, s, pal) {
    ctx.fillStyle = pal[0];
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(s * 0.12, -s * 0.16);
      ctx.lineTo(0, -s * 0.42);
      ctx.lineTo(-s * 0.12, -s * 0.16);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = pal[3];
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  function porous(ctx, s, pal) {
    ctx.fillStyle = pal[0];
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal[2];
    ctx.beginPath();
    ctx.arc(-s * 0.1, -s * 0.06, s * 0.07, 0, Math.PI * 2);
    ctx.arc(s * 0.1, s * 0.08, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  function colonial(ctx, s, pal) {
    const spots = [[0, 0], [-0.22, 0.05], [0.18, 0.08], [0.02, -0.22], [-0.08, 0.22]];
    spots.forEach(function (spot, i) {
      ctx.fillStyle = i === 0 ? pal[1] : pal[0];
      ctx.beginPath();
      ctx.arc(spot[0] * s, spot[1] * s, s * (i === 0 ? 0.16 : 0.1), 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawSurveyor(ctx, x, y, time) {
    const bob = reduced() ? 0 : Math.sin(time / 180) * 1;
    ctx.fillStyle = '#0e1412';
    ctx.fillRect(x + 4, y + 13, 8, 2);
    ctx.fillStyle = '#24362e';
    ctx.fillRect(x + 5, y + 6 + bob, 6, 7);
    ctx.fillStyle = '#e7f2ea';
    ctx.fillRect(x + 6, y + 3 + bob, 4, 4);
    ctx.fillStyle = '#e6c56e';
    ctx.beginPath();
    ctx.arc(x + 12, y + 8 + bob, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  root.AetherArt = { drawResonant: drawResonant, drawTile: drawTile, drawSurveyor: drawSurveyor, palette: palette };
})(typeof globalThis !== 'undefined' ? globalThis : this);
