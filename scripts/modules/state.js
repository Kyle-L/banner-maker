export const DEFAULTS = Object.freeze({
  width: 1280,
  height: 640,
  radius: 80,
  title: 'your-repo',
  sub: 'A blazing-fast open source tool.',
  titleSize: 96,
  subSize: 36,
  titleColor: '#ffffff',
  subColor: '#a0aec0',
  titleFontFamily: 'CircularStd',
  titleFontWeight: '700',
  subFontFamily: 'CircularStd',
  subFontWeight: '300',
  textAlign: 'center',
  bgFillType: 'gradient',
  bgSolid: '#0d1117',
  gradAngle: 135,
  bgImageEnabled: false,
  bgImgFit: 'cover',
  bgImageOpacity: 100,
  overlayEnabled: true,
  overlayOpacity: 35,
  overlayBlendMode: 'overlay',
  noiseOn: true,
  noiseOpacity: 18,
  scaleVisuals: false,
});

export const defaultGradientStops = () => [
  { color: '#0d1117', pos: 0 },
  { color: '#1a1a4e', pos: 50 },
  { color: '#0a2a1a', pos: 100 },
];

export function createInitialState() {
  return {
    ...DEFAULTS,
    gradStops: defaultGradientStops(),
    aspectLocked: false,
    aspectRatio: 1280 / 640,
    bgImageEl: null,
    bgImageThumb: '',
    panelWidth: 360,
  };
}
