export const IMAGE_SOURCES = [
  {
    id: 'pexels',
    label: 'Pexels',
    keyStorageKey: 'bm_pexels_key',
    keyPlaceholder: 'Pexels API key (free at pexels.com/api)',
    keyLink: 'https://www.pexels.com/api/',
    async search(query, apiKey) {
      if (!apiKey) throw new Error('NO_KEY');
      const r = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=18&orientation=landscape`,
        { headers: { Authorization: apiKey } }
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      return d.photos.map((p) => ({
        thumb: p.src.medium,
        full: p.src.large2x || p.src.original,
        credit: `Photo: ${p.photographer}`,
      }));
    },
  },
  {
    id: 'pixabay',
    label: 'Pixabay',
    keyStorageKey: 'bm_pixabay_key',
    keyPlaceholder: 'Pixabay API key (free at pixabay.com/api)',
    keyLink: 'https://pixabay.com/api/docs/',
    async search(query, apiKey) {
      if (!apiKey) throw new Error('NO_KEY');
      const r = await fetch(
        `https://pixabay.com/api/?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=18&safesearch=true`
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      return d.hits.map((h) => ({
        thumb: h.previewURL,
        full: h.largeImageURL,
        credit: `Photo: ${h.user}`,
      }));
    },
  },
];

export const GRADIENT_PRESETS = [
  { name: 'Midnight', angle: 135, stops: [{ color: '#0f0c29', pos: 0 }, { color: '#302b63', pos: 50 }, { color: '#24243e', pos: 100 }] },
  { name: 'Oceanic', angle: 135, stops: [{ color: '#1a6cf7', pos: 0 }, { color: '#00c6ff', pos: 100 }] },
  { name: 'Emerald', angle: 135, stops: [{ color: '#11998e', pos: 0 }, { color: '#38ef7d', pos: 100 }] },
  { name: 'Coral', angle: 135, stops: [{ color: '#FF512F', pos: 0 }, { color: '#DD2476', pos: 100 }] },
  { name: 'Sunset', angle: 45, stops: [{ color: '#f7971e', pos: 0 }, { color: '#ffd200', pos: 100 }] },
  { name: 'Deep Space', angle: 135, stops: [{ color: '#000000', pos: 0 }, { color: '#434343', pos: 100 }] },
  { name: 'Celestial', angle: 270, stops: [{ color: '#c33764', pos: 0 }, { color: '#1d2671', pos: 100 }] },
  { name: 'Cool Blues', angle: 135, stops: [{ color: '#2193b0', pos: 0 }, { color: '#6dd5ed', pos: 100 }] },
  { name: 'Dark Ocean', angle: 180, stops: [{ color: '#373B44', pos: 0 }, { color: '#4286f4', pos: 100 }] },
  { name: 'Rose Gold', angle: 135, stops: [{ color: '#B76E79', pos: 0 }, { color: '#997A8D', pos: 50 }, { color: '#E8CFCF', pos: 100 }] },
  { name: 'Neon Glow', angle: 135, stops: [{ color: '#12c2e9', pos: 0 }, { color: '#c471ed', pos: 50 }, { color: '#f64f59', pos: 100 }] },
  { name: 'Forest', angle: 135, stops: [{ color: '#134E5E', pos: 0 }, { color: '#71B280', pos: 100 }] },
];

export const LOCAL_FONTS = [{ family: 'CircularStd', label: 'Circular Std' }];

export const GOOGLE_FONTS_POPULAR = [
  'Roboto', 'Open Sans', 'Poppins', 'Lato', 'Raleway', 'Oswald',
  'Montserrat', 'Nunito', 'Playfair Display', 'Source Code Pro',
  'Space Grotesk', 'Inter', 'Bebas Neue', 'DM Sans', 'Outfit',
  'Fira Code', 'JetBrains Mono', 'Space Mono', 'Syne',
];
