function gradientCoords(angle, w, h) {
  const rad = (angle - 90) * Math.PI / 180;
  const len = Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad));
  const cx = w / 2;
  const cy = h / 2;
  const dx = Math.cos(rad) * len / 2;
  const dy = Math.sin(rad) * len / 2;
  return { x0: cx - dx, y0: cy - dy, x1: cx + dx, y1: cy + dy };
}

function roundedRect(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.arcTo(x + w, y, x + w, y + r, r);
  c.lineTo(x + w, y + h - r);
  c.arcTo(x + w, y + h, x + w - r, y + h, r);
  c.lineTo(x + r, y + h);
  c.arcTo(x, y + h, x, y + h - r, r);
  c.lineTo(x, y + r);
  c.arcTo(x, y, x + r, y, r);
  c.closePath();
}

function buildNoiseCanvas() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const nctx = canvas.getContext('2d');
  const id = nctx.createImageData(size, size);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = Math.random() > 0.5 ? 255 : 0;
    const a = 20 + ((Math.random() * 90) | 0);
    id.data[i] = v;
    id.data[i + 1] = v;
    id.data[i + 2] = v;
    id.data[i + 3] = a;
  }
  nctx.putImageData(id, 0, 0);
  return canvas;
}

export function createRenderer(canvas, state) {
  const ctx = canvas.getContext('2d');
  const noiseCanvas = buildNoiseCanvas();

  function drawFillLayer(W, H) {
    if (state.bgFillType === 'solid') {
      ctx.fillStyle = state.bgSolid;
      ctx.fillRect(0, 0, W, H);
      return;
    }
    const stops = [...state.gradStops].sort((a, b) => a.pos - b.pos);
    const { x0, y0, x1, y1 } = gradientCoords(state.gradAngle, W, H);
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach((s) => grad.addColorStop(s.pos / 100, s.color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawImageLayer(W, H) {
    if (!(state.bgImageEnabled && state.bgImageEl)) return;
    const img = state.bgImageEl;
    const iW = img.naturalWidth;
    const iH = img.naturalHeight;
    if (!iW || !iH) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, state.bgImageOpacity / 100));

    if (state.bgImgFit === 'cover') {
      const s = Math.max(W / iW, H / iH);
      const dw = iW * s;
      const dh = iH * s;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else if (state.bgImgFit === 'contain') {
      const s = Math.min(W / iW, H / iH);
      const dw = iW * s;
      const dh = iH * s;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      ctx.drawImage(img, 0, 0, W, H);
    }

    ctx.restore();
  }

  function render() {
    const W = state.width;
    const H = state.height;
    const R = state.radius;

    canvas.width = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    ctx.save();
    roundedRect(ctx, 0, 0, W, H, R);
    ctx.clip();

    drawFillLayer(W, H);
    drawImageLayer(W, H);

    if (state.bgImageEnabled && state.bgImageEl && state.overlayEnabled) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, state.overlayOpacity / 100));
      ctx.globalCompositeOperation = state.overlayBlendMode;
      drawFillLayer(W, H);
      ctx.restore();
    }

    if (state.noiseOn && state.noiseOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, state.noiseOpacity / 100));
      ctx.globalCompositeOperation = 'soft-light';
      const pattern = ctx.createPattern(noiseCanvas, 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    const align = state.textAlign;
    const tx = align === 'left' ? W * 0.08 : align === 'right' ? W * 0.92 : W / 2;

    ctx.textAlign = align;
    ctx.textBaseline = 'alphabetic';

    const titleFont = `${state.titleFontWeight} ${state.titleSize}px "${state.titleFontFamily}", sans-serif`;
    const subFont = `${state.subFontWeight} ${state.subSize}px "${state.subFontFamily}", sans-serif`;
    const gap = Math.round(state.titleSize * 0.25);
    const titleH = state.titleSize;
    const subH = state.subSize;
    const blockY = (H - (titleH + gap + subH)) / 2;

    ctx.save();
    ctx.font = titleFont;
    ctx.fillStyle = state.titleColor;
    ctx.fillText(state.title, tx, blockY + titleH);
    ctx.restore();

    if (state.sub) {
      ctx.save();
      ctx.font = subFont;
      ctx.fillStyle = state.subColor;
      ctx.fillText(state.sub, tx, blockY + titleH + gap + subH);
      ctx.restore();
    }

    ctx.restore();
  }

  return { render };
}
