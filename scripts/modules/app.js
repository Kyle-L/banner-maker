import { IMAGE_SOURCES, GRADIENT_PRESETS, LOCAL_FONTS, GOOGLE_FONTS_POPULAR } from './constants.js';
import { DEFAULTS, createInitialState, defaultGradientStops } from './state.js';
import { createRenderer } from './renderer.js';

export function initBannerMaker() {
  const state = createInitialState();
  const canvas = document.getElementById('bannerCanvas');
  const { render } = createRenderer(canvas, state);
  const customFonts = [];

  function setSegmented(containerId, value) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.querySelectorAll('.seg').forEach((b) => b.classList.toggle('active', b.dataset.val === value));
  }

  function bind(id, key, type = 'value', parse = (v) => v) {
    const el = document.getElementById(id);
    if (!el) return;
    const evts = type === 'checked' ? ['change'] : ['input', 'change'];
    evts.forEach((evt) => {
      el.addEventListener(evt, () => {
        state[key] = parse(el[type]);
        render();
      });
    });
  }

  function syncSliderNum(rangeId, numId, key, parse = Number) {
    const range = document.getElementById(rangeId);
    const num = document.getElementById(numId);
    const update = (val) => {
      state[key] = parse(val);
      range.value = state[key];
      num.value = state[key];
      render();
    };
    range.addEventListener('input', () => update(range.value));
    range.addEventListener('change', () => update(range.value));
    num.addEventListener('input', () => update(num.value));
    num.addEventListener('change', () => update(num.value));
  }

  function bindSegmented(containerId, key, onChange) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.querySelectorAll('.seg').forEach((btn) => {
      btn.addEventListener('click', () => {
        setSegmented(containerId, btn.dataset.val);
        state[key] = btn.dataset.val;
        if (onChange) onChange();
        render();
      });
    });
  }

  function toggleBgControls() {
    document.getElementById('solidControls').style.display = state.bgFillType === 'solid' ? '' : 'none';
    document.getElementById('gradientControls').style.display = state.bgFillType === 'gradient' ? '' : 'none';
    document.getElementById('imageControls').style.display = state.bgImageEnabled ? '' : 'none';
    document.getElementById('overlayControls').style.display = state.overlayEnabled ? '' : 'none';
  }

  const lockBtn = document.getElementById('lockAspect');
  lockBtn.addEventListener('click', () => {
    state.aspectLocked = !state.aspectLocked;
    if (state.aspectLocked) state.aspectRatio = state.width / state.height;
    lockBtn.classList.toggle('locked', state.aspectLocked);
    lockBtn.querySelector('.icon-unlink').style.display = state.aspectLocked ? 'none' : '';
    lockBtn.querySelector('.icon-link').style.display = state.aspectLocked ? '' : 'none';
  });

  function applyScaling(prevW, prevH, nextW, nextH) {
    if (!state.scaleVisuals) return;
    const oldScale = Math.sqrt(prevW * prevH);
    const newScale = Math.sqrt(nextW * nextH);
    if (!oldScale || !newScale) return;
    const factor = newScale / oldScale;
    state.titleSize = Math.max(8, Math.min(360, Math.round(state.titleSize * factor)));
    state.subSize = Math.max(8, Math.min(240, Math.round(state.subSize * factor)));
    state.radius = Math.max(0, Math.min(300, Math.round(state.radius * factor)));
    document.getElementById('bTitleSize').value = state.titleSize;
    document.getElementById('bSubSize').value = state.subSize;
    document.getElementById('bRadius').value = state.radius;
    document.getElementById('bRadiusNum').value = state.radius;
  }

  function setWidth(v) {
    v = Math.max(1, parseInt(v, 10) || 1);
    const prevW = state.width;
    const prevH = state.height;
    state.width = v;
    document.getElementById('bWidth').value = v;
    if (state.aspectLocked) {
      const h = Math.round(v / state.aspectRatio);
      state.height = h;
      document.getElementById('bHeight').value = h;
    }
    applyScaling(prevW, prevH, state.width, state.height);
    render();
  }

  function setHeight(v) {
    v = Math.max(1, parseInt(v, 10) || 1);
    const prevW = state.width;
    const prevH = state.height;
    state.height = v;
    document.getElementById('bHeight').value = v;
    if (state.aspectLocked) {
      const w = Math.round(v * state.aspectRatio);
      state.width = w;
      document.getElementById('bWidth').value = w;
    }
    applyScaling(prevW, prevH, state.width, state.height);
    render();
  }

  function buildStopRows() {
    const stopsContainer = document.getElementById('gradStops');
    stopsContainer.innerHTML = '';
    state.gradStops.forEach((stop, i) => {
      const row = document.createElement('div');
      row.className = 'stop-row';
      const colorIn = document.createElement('input');
      colorIn.type = 'color';
      colorIn.value = stop.color;
      colorIn.addEventListener('input', () => { state.gradStops[i].color = colorIn.value; render(); });
      const posSlider = document.createElement('input');
      posSlider.type = 'range';
      posSlider.min = 0;
      posSlider.max = 100;
      posSlider.value = stop.pos;
      const posNum = document.createElement('input');
      posNum.type = 'number';
      posNum.className = 'num-sync stop-pos-num';
      posNum.min = 0;
      posNum.max = 100;
      posNum.value = stop.pos;
      posSlider.addEventListener('input', () => {
        const val = Number(posSlider.value);
        state.gradStops[i].pos = val;
        posNum.value = val;
        render();
      });
      posSlider.addEventListener('change', () => {
        const val = Number(posSlider.value);
        state.gradStops[i].pos = val;
        posNum.value = val;
        render();
      });
      posNum.addEventListener('input', () => {
        const val = Math.max(0, Math.min(100, Number(posNum.value) || 0));
        state.gradStops[i].pos = val;
        posSlider.value = val;
        render();
      });
      posNum.addEventListener('change', () => {
        const val = Math.max(0, Math.min(100, Number(posNum.value) || 0));
        state.gradStops[i].pos = val;
        posSlider.value = val;
        render();
      });
      const delBtn = document.createElement('button');
      delBtn.className = 'stop-del';
      delBtn.textContent = 'x';
      delBtn.addEventListener('click', () => {
        if (state.gradStops.length <= 2) return;
        state.gradStops.splice(i, 1);
        buildStopRows();
        render();
      });
      row.append(colorIn, posSlider, posNum, delBtn);
      stopsContainer.appendChild(row);
    });
  }

  function updateBgPreview() {
    const el = document.getElementById('bgImgPreview');
    if (state.bgImageThumb) {
      el.style.backgroundImage = `url(${state.bgImageThumb})`;
      el.innerHTML = '';
    } else {
      el.style.backgroundImage = '';
      el.innerHTML = '<span class="no-img-hint">No image selected</span>';
    }
  }

  function closeModal(id) {
    document.getElementById(id).setAttribute('hidden', '');
  }
  function openModal(id) {
    const el = document.getElementById(id);
    el.removeAttribute('hidden');
  }

  function selectBgImage(fullUrl, thumbUrl) {
    closeModal('imagePickerModal');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      state.bgImageEl = img;
      state.bgImageThumb = thumbUrl || fullUrl;
      state.bgImageEnabled = true;
      document.getElementById('bgImageEnabled').checked = true;
      toggleBgControls();
      updateBgPreview();
      render();
    };
    img.onerror = () => alert('Failed to load image from source.');
    img.src = fullUrl;
  }

  function loadFileAsBgImage(file) {
    closeModal('imagePickerModal');
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      state.bgImageEl = img;
      state.bgImageThumb = url;
      state.bgImageEnabled = true;
      document.getElementById('bgImageEnabled').checked = true;
      toggleBgControls();
      updateBgPreview();
      render();
    };
    img.onerror = () => alert('Could not load selected file.');
    img.src = url;
  }

  function buildPresetGrid() {
    const grid = document.getElementById('presetGrid');
    grid.innerHTML = '';
    GRADIENT_PRESETS.forEach((preset) => {
      const swatch = document.createElement('div');
      swatch.className = 'preset-swatch';
      swatch.style.background = `linear-gradient(${preset.angle}deg, ${preset.stops.map((s) => `${s.color} ${s.pos}%`).join(', ')})`;
      const label = document.createElement('span');
      label.className = 'preset-name';
      label.textContent = preset.name;
      swatch.appendChild(label);
      swatch.addEventListener('click', () => {
        state.gradStops = preset.stops.map((s) => ({ ...s }));
        state.gradAngle = preset.angle;
        document.getElementById('gradAngle').value = preset.angle;
        document.getElementById('gradAngleNum').value = preset.angle;
        buildStopRows();
        closeModal('gradPresetsModal');
        render();
      });
      grid.appendChild(swatch);
    });
  }

  function buildImagePickerModal() {
    const tabsEl = document.getElementById('imgModalTabs');
    const bodyEl = document.getElementById('imgModalBody');
    tabsEl.innerHTML = '';
    bodyEl.innerHTML = '';

    IMAGE_SOURCES.forEach((src, idx) => {
      const tab = document.createElement('button');
      tab.className = `img-tab${idx === 0 ? ' active' : ''}`;
      tab.textContent = src.label;
      tab.dataset.pane = src.id;
      tabsEl.appendChild(tab);

      const pane = document.createElement('div');
      pane.className = 'img-source-pane';
      pane.id = `img-pane-${src.id}`;
      if (idx !== 0) pane.hidden = true;

      const savedKey = localStorage.getItem(src.keyStorageKey) || '';
      pane.innerHTML = `
        <div class="img-search-row">
          <input type="text" class="img-query" placeholder="Search photos..." autocomplete="off" />
          <button class="btn-search">Search</button>
        </div>
        <div class="img-key-row">
          <input type="text" class="img-api-key" placeholder="${src.keyPlaceholder}" value="${savedKey}" autocomplete="off" />
          <a class="img-key-link" href="${src.keyLink}" target="_blank" rel="noopener noreferrer">Get key</a>
        </div>
        <div class="img-results"><div class="img-status">Enter a query and API key.</div></div>
      `;

      const keyInput = pane.querySelector('.img-api-key');
      keyInput.addEventListener('change', () => localStorage.setItem(src.keyStorageKey, keyInput.value.trim()));

      const searchBtn = pane.querySelector('.btn-search');
      const queryInput = pane.querySelector('.img-query');
      const resultsArea = pane.querySelector('.img-results');

      const doSearch = async () => {
        const query = queryInput.value.trim();
        const apiKey = keyInput.value.trim();
        if (!query) return;
        searchBtn.disabled = true;
        searchBtn.textContent = '...';
        resultsArea.innerHTML = '<div class="img-status">Loading...</div>';
        try {
          const results = await src.search(query, apiKey);
          if (!results.length) {
            resultsArea.innerHTML = '<div class="img-status">No results found.</div>';
            return;
          }
          const grid = document.createElement('div');
          grid.className = 'img-grid';
          results.forEach((item) => {
            const thumb = document.createElement('div');
            thumb.className = 'img-thumb';
            const img = document.createElement('img');
            img.src = item.thumb;
            img.alt = item.credit;
            img.loading = 'lazy';
            thumb.appendChild(img);
            thumb.addEventListener('click', () => selectBgImage(item.full, item.thumb));
            grid.appendChild(thumb);
          });
          resultsArea.innerHTML = '';
          resultsArea.appendChild(grid);
        } catch (err) {
          if (err.message === 'NO_KEY') {
            resultsArea.innerHTML = `<div class="img-status">Missing API key. <a href="${src.keyLink}" target="_blank" rel="noopener noreferrer">Get one</a>.</div>`;
          } else {
            resultsArea.innerHTML = `<div class="img-status">Error: ${err.message}</div>`;
          }
        } finally {
          searchBtn.disabled = false;
          searchBtn.textContent = 'Search';
        }
      };

      searchBtn.addEventListener('click', doSearch);
      queryInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
      bodyEl.appendChild(pane);
    });

    const uploadTab = document.createElement('button');
    uploadTab.className = 'img-tab';
    uploadTab.textContent = 'Upload';
    uploadTab.dataset.pane = 'upload';
    tabsEl.appendChild(uploadTab);

    const uploadPane = document.createElement('div');
    uploadPane.className = 'img-source-pane upload-pane';
    uploadPane.id = 'img-pane-upload';
    uploadPane.hidden = true;
    uploadPane.innerHTML = `
      <div class="upload-drop-area" id="modalDropArea">
        <p>Drop an image here, or click to browse.</p>
        <input type="file" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;" id="modalFileInput" />
      </div>
    `;
    bodyEl.appendChild(uploadPane);

    const dropArea = uploadPane.querySelector('#modalDropArea');
    const fileInput = uploadPane.querySelector('#modalFileInput');
    dropArea.addEventListener('dragover', (e) => { e.preventDefault(); dropArea.classList.add('drag-over'); });
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-over'));
    dropArea.addEventListener('drop', (e) => {
      e.preventDefault();
      dropArea.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) loadFileAsBgImage(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) loadFileAsBgImage(fileInput.files[0]);
    });

    tabsEl.querySelectorAll('.img-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        tabsEl.querySelectorAll('.img-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        bodyEl.querySelectorAll('.img-source-pane').forEach((p) => { p.hidden = true; });
        const target = bodyEl.querySelector(`#img-pane-${tab.dataset.pane}`);
        if (target) target.hidden = false;
      });
    });
  }

  function buildFontSelects() {
    ['titleFontFamily', 'subFontFamily'].forEach((id) => {
      const sel = document.getElementById(id);
      sel.innerHTML = '';
      const localGroup = document.createElement('optgroup');
      localGroup.label = 'Local Fonts';
      LOCAL_FONTS.forEach((f) => localGroup.appendChild(new Option(f.label, f.family)));
      sel.appendChild(localGroup);

      const googleGroup = document.createElement('optgroup');
      googleGroup.label = 'Google Fonts';
      GOOGLE_FONTS_POPULAR.forEach((f) => googleGroup.appendChild(new Option(f, f)));
      sel.appendChild(googleGroup);

      if (customFonts.length) {
        const customGroup = document.createElement('optgroup');
        customGroup.label = 'Custom Loaded';
        customFonts.forEach((f) => customGroup.appendChild(new Option(f, f)));
        sel.appendChild(customGroup);
      }
    });
    document.getElementById('titleFontFamily').value = state.titleFontFamily;
    document.getElementById('subFontFamily').value = state.subFontFamily;
  }

  async function loadGoogleFont(family) {
    const safeName = family.trim().replace(/\s+/g, '+');
    const url = `https://fonts.googleapis.com/css2?family=${safeName}:wght@300;400;500;700;900&display=swap`;
    if (document.querySelector(`link[data-gf="${family}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.dataset.gf = family;
    document.head.appendChild(link);
    await new Promise((res, rej) => {
      link.addEventListener('load', res, { once: true });
      link.addEventListener('error', rej, { once: true });
    });
    await document.fonts.ready;
  }

  function addCustomFont(family) {
    if (!customFonts.includes(family)) customFonts.push(family);
    buildFontSelects();
  }

  const gfLoad = document.getElementById('gfLoad');
  gfLoad.addEventListener('click', async () => {
    const input = document.getElementById('gfInput');
    const family = input.value.trim();
    if (!family) return;
    gfLoad.classList.add('loading');
    gfLoad.textContent = '...';
    try {
      await loadGoogleFont(family);
      addCustomFont(family);
      input.value = '';
    } catch {
      alert(`Could not load ${family}`);
    } finally {
      gfLoad.classList.remove('loading');
      gfLoad.textContent = 'Load';
    }
  });

  async function onFontSelectChange(id, key) {
    const family = document.getElementById(id).value;
    const isLocal = LOCAL_FONTS.some((f) => f.family === family);
    if (!isLocal) {
      try { await loadGoogleFont(family); } catch { }
    }
    state[key] = family;
    render();
  }

  function attachPanelResize() {
    const resizer = document.getElementById('panelResizer');
    const root = document.documentElement;
    let active = false;

    const onMove = (clientX) => {
      if (!active) return;
      const min = 260;
      const max = Math.min(620, window.innerWidth * 0.6);
      const width = Math.max(min, Math.min(max, clientX));
      state.panelWidth = width;
      root.style.setProperty('--panel-w', `${width}px`);
    };

    resizer.addEventListener('pointerdown', (e) => {
      active = true;
      document.body.classList.add('resizing');
      resizer.setPointerCapture(e.pointerId);
    });

    resizer.addEventListener('pointermove', (e) => onMove(e.clientX));
    resizer.addEventListener('pointerup', () => {
      active = false;
      document.body.classList.remove('resizing');
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 860) return;
      const max = Math.min(620, window.innerWidth * 0.6);
      if (state.panelWidth > max) {
        state.panelWidth = max;
        root.style.setProperty('--panel-w', `${max}px`);
      }
    });
  }

  const groupResets = {
    dimensions() {
      const prevW = state.width;
      const prevH = state.height;
      state.width = DEFAULTS.width;
      state.height = DEFAULTS.height;
      state.radius = DEFAULTS.radius;
      state.scaleVisuals = DEFAULTS.scaleVisuals;
      document.getElementById('bWidth').value = state.width;
      document.getElementById('bHeight').value = state.height;
      document.getElementById('bRadius').value = state.radius;
      document.getElementById('bRadiusNum').value = state.radius;
      document.getElementById('scaleVisuals').checked = state.scaleVisuals;
      applyScaling(prevW, prevH, state.width, state.height);
    },
    text() {
      state.title = DEFAULTS.title;
      state.sub = DEFAULTS.sub;
      state.titleSize = DEFAULTS.titleSize;
      state.subSize = DEFAULTS.subSize;
      state.titleColor = DEFAULTS.titleColor;
      state.subColor = DEFAULTS.subColor;
      state.titleFontFamily = DEFAULTS.titleFontFamily;
      state.titleFontWeight = DEFAULTS.titleFontWeight;
      state.subFontFamily = DEFAULTS.subFontFamily;
      state.subFontWeight = DEFAULTS.subFontWeight;
      state.textAlign = DEFAULTS.textAlign;
      document.getElementById('bTitle').value = state.title;
      document.getElementById('bSub').value = state.sub;
      document.getElementById('bTitleSize').value = state.titleSize;
      document.getElementById('bSubSize').value = state.subSize;
      document.getElementById('bTitleColor').value = state.titleColor;
      document.getElementById('bSubColor').value = state.subColor;
      document.getElementById('titleFontFamily').value = state.titleFontFamily;
      document.getElementById('titleFontWeight').value = state.titleFontWeight;
      document.getElementById('subFontFamily').value = state.subFontFamily;
      document.getElementById('subFontWeight').value = state.subFontWeight;
      setSegmented('textAlign', state.textAlign);
    },
    background() {
      state.bgFillType = DEFAULTS.bgFillType;
      state.bgSolid = DEFAULTS.bgSolid;
      state.gradAngle = DEFAULTS.gradAngle;
      state.gradStops = defaultGradientStops();
      state.bgImageEnabled = DEFAULTS.bgImageEnabled;
      state.bgImgFit = DEFAULTS.bgImgFit;
      state.bgImageOpacity = DEFAULTS.bgImageOpacity;
      state.overlayEnabled = DEFAULTS.overlayEnabled;
      state.overlayOpacity = DEFAULTS.overlayOpacity;
      state.overlayBlendMode = DEFAULTS.overlayBlendMode;
      state.bgImageEl = null;
      state.bgImageThumb = '';
      document.getElementById('bgSolid').value = state.bgSolid;
      document.getElementById('gradAngle').value = state.gradAngle;
      document.getElementById('gradAngleNum').value = state.gradAngle;
      document.getElementById('bgImageEnabled').checked = state.bgImageEnabled;
      document.getElementById('bgImageOpacity').value = state.bgImageOpacity;
      document.getElementById('bgImageOpacityNum').value = state.bgImageOpacity;
      document.getElementById('overlayEnabled').checked = state.overlayEnabled;
      document.getElementById('overlayOpacity').value = state.overlayOpacity;
      document.getElementById('overlayOpacityNum').value = state.overlayOpacity;
      document.getElementById('overlayBlendMode').value = state.overlayBlendMode;
      setSegmented('bgFillType', state.bgFillType);
      setSegmented('bgImgFit', state.bgImgFit);
      updateBgPreview();
      buildStopRows();
      toggleBgControls();
    },
    texture() {
      state.noiseOn = DEFAULTS.noiseOn;
      state.noiseOpacity = DEFAULTS.noiseOpacity;
      document.getElementById('noiseOn').checked = state.noiseOn;
      document.getElementById('noiseOpacity').value = state.noiseOpacity;
      document.getElementById('noiseOpacityNum').value = state.noiseOpacity;
    },
  };

  document.querySelectorAll('.btn-reset-group').forEach((btn) => {
    const group = btn.closest('[data-group]').dataset.group;
    btn.addEventListener('click', () => {
      if (groupResets[group]) groupResets[group]();
      render();
    });
  });

  document.getElementById('bWidth').addEventListener('input', (e) => setWidth(e.target.value));
  document.getElementById('bWidth').addEventListener('change', (e) => setWidth(e.target.value));
  document.getElementById('bHeight').addEventListener('input', (e) => setHeight(e.target.value));
  document.getElementById('bHeight').addEventListener('change', (e) => setHeight(e.target.value));

  bind('scaleVisuals', 'scaleVisuals', 'checked');
  syncSliderNum('bRadius', 'bRadiusNum', 'radius', Number);

  bind('bTitle', 'title');
  bind('bSub', 'sub');
  bind('bTitleSize', 'titleSize', 'value', Number);
  bind('bSubSize', 'subSize', 'value', Number);
  bind('bTitleColor', 'titleColor');
  bind('bSubColor', 'subColor');
  bind('titleFontWeight', 'titleFontWeight');
  bind('subFontWeight', 'subFontWeight');
  document.getElementById('titleFontFamily').addEventListener('change', () => onFontSelectChange('titleFontFamily', 'titleFontFamily'));
  document.getElementById('subFontFamily').addEventListener('change', () => onFontSelectChange('subFontFamily', 'subFontFamily'));
  bindSegmented('textAlign', 'textAlign');

  bindSegmented('bgFillType', 'bgFillType', toggleBgControls);
  bind('bgSolid', 'bgSolid');
  syncSliderNum('gradAngle', 'gradAngleNum', 'gradAngle', Number);
  document.getElementById('addStop').addEventListener('click', () => {
    state.gradStops.push({ color: '#6ee7b7', pos: 75 });
    buildStopRows();
    render();
  });

  bind('bgImageEnabled', 'bgImageEnabled', 'checked', (v) => v);
  document.getElementById('bgImageEnabled').addEventListener('change', () => {
    toggleBgControls();
    render();
  });
  bindSegmented('bgImgFit', 'bgImgFit');
  syncSliderNum('bgImageOpacity', 'bgImageOpacityNum', 'bgImageOpacity', Number);

  bind('overlayEnabled', 'overlayEnabled', 'checked', (v) => v);
  document.getElementById('overlayEnabled').addEventListener('change', () => {
    toggleBgControls();
    render();
  });
  syncSliderNum('overlayOpacity', 'overlayOpacityNum', 'overlayOpacity', Number);
  bind('overlayBlendMode', 'overlayBlendMode');

  bind('noiseOn', 'noiseOn', 'checked');
  syncSliderNum('noiseOpacity', 'noiseOpacityNum', 'noiseOpacity', Number);

  document.getElementById('openPresets').addEventListener('click', () => {
    buildPresetGrid();
    openModal('gradPresetsModal');
  });

  document.getElementById('openImagePicker').addEventListener('click', () => {
    buildImagePickerModal();
    openModal('imagePickerModal');
  });

  document.getElementById('imgUpload').addEventListener('change', function () {
    if (this.files[0]) loadFileAsBgImage(this.files[0]);
  });

  document.querySelectorAll('.btn-modal-close').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modal));
  });

  document.getElementById('gradPresetsModal').addEventListener('click', (e) => {
    if (e.target.id === 'gradPresetsModal') closeModal('gradPresetsModal');
  });
  document.getElementById('imagePickerModal').addEventListener('click', (e) => {
    if (e.target.id === 'imagePickerModal') closeModal('imagePickerModal');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    ['gradPresetsModal', 'imagePickerModal'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el.hasAttribute('hidden')) closeModal(id);
    });
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    try {
      render();
      const a = document.createElement('a');
      const slug = (state.title || 'banner').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      a.download = `${slug}-banner.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch {
      alert('Export failed. If a remote image blocks CORS, try uploading that image instead.');
    }
  });

  attachPanelResize();
  buildFontSelects();
  buildStopRows();
  toggleBgControls();
  updateBgPreview();
  render();
}
