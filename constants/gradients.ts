export type AppGradientVariant =
  | 'default'
  | 'home'
  | 'report'
  | 'create'
  | 'run'
  | 'complete'
  | 'settings';

type GradientPoint = {
  x: number;
  y: number;
};

type GradientColors = readonly [string, string, ...string[]];

export type GradientSpec = {
  backgroundColors: GradientColors;
  backgroundStart: GradientPoint;
  backgroundEnd: GradientPoint;
  heroColors: GradientColors;
  heroStart: GradientPoint;
  heroEnd: GradientPoint;
  heroOverlayOpacity?: number;
};

const BASE_BACKGROUND_START: GradientPoint = { x: 0.06, y: 0.02 };
const BASE_BACKGROUND_END: GradientPoint = { x: 0.94, y: 0.98 };

const BASE_HERO_START: GradientPoint = { x: 0, y: 0 };
const BASE_HERO_END: GradientPoint = { x: 1, y: 1 };

const gradientSpecs: Record<AppGradientVariant, GradientSpec> = {
  default: {
    backgroundColors: ['#070d1a', '#0b1a2f', '#123548'],
    backgroundStart: BASE_BACKGROUND_START,
    backgroundEnd: BASE_BACKGROUND_END,
    heroColors: ['#11233b', '#17324c', '#1a4f63'],
    heroStart: BASE_HERO_START,
    heroEnd: BASE_HERO_END,
    heroOverlayOpacity: 0.06,
  },
  home: {
    backgroundColors: ['#070d1a', '#0d2138', '#174155'],
    backgroundStart: BASE_BACKGROUND_START,
    backgroundEnd: BASE_BACKGROUND_END,
    heroColors: ['#13263f', '#1b3b56', '#1f5368'],
    heroStart: BASE_HERO_START,
    heroEnd: BASE_HERO_END,
    heroOverlayOpacity: 0.06,
  },
  report: {
    backgroundColors: ['#070d1a', '#0a1b31', '#1a4f63'],
    backgroundStart: BASE_BACKGROUND_START,
    backgroundEnd: BASE_BACKGROUND_END,
    heroColors: ['#10233b', '#19405b', '#1d5f72'],
    heroStart: BASE_HERO_START,
    heroEnd: BASE_HERO_END,
    heroOverlayOpacity: 0.05,
  },
  create: {
    backgroundColors: ['#070d1a', '#0b1a2f', '#123548'],
    backgroundStart: BASE_BACKGROUND_START,
    backgroundEnd: BASE_BACKGROUND_END,
    heroColors: ['#11243a', '#1a3550', '#1e4b61'],
    heroStart: BASE_HERO_START,
    heroEnd: BASE_HERO_END,
    heroOverlayOpacity: 0.05,
  },
  run: {
    backgroundColors: ['#060b16', '#0a1a30', '#123548'],
    backgroundStart: BASE_BACKGROUND_START,
    backgroundEnd: BASE_BACKGROUND_END,
    heroColors: ['#0f2036', '#17334d', '#1c4a60'],
    heroStart: BASE_HERO_START,
    heroEnd: BASE_HERO_END,
    heroOverlayOpacity: 0.04,
  },
  complete: {
    backgroundColors: ['#070f1a', '#0c2434', '#1a4c58'],
    backgroundStart: BASE_BACKGROUND_START,
    backgroundEnd: BASE_BACKGROUND_END,
    heroColors: ['#10283c', '#1b3e54', '#255867'],
    heroStart: BASE_HERO_START,
    heroEnd: BASE_HERO_END,
    heroOverlayOpacity: 0.05,
  },
  settings: {
    backgroundColors: ['#070d1a', '#0c1a2d', '#174157'],
    backgroundStart: BASE_BACKGROUND_START,
    backgroundEnd: BASE_BACKGROUND_END,
    heroColors: ['#11243b', '#1a3750', '#1f4f63'],
    heroStart: BASE_HERO_START,
    heroEnd: BASE_HERO_END,
    heroOverlayOpacity: 0.05,
  },
};

export function getGradientSpec(variant: AppGradientVariant = 'default'): GradientSpec {
  return gradientSpecs[variant] ?? gradientSpecs.default;
}
