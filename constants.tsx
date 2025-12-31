
import { Atmosphere, Theme } from './types';

export const THEMES: Record<Atmosphere, Theme> = {
  [Atmosphere.SOVEREIGN]: {
    bg: '#FDFCF0', 
    surface: '#F7F4E5',
    accent: '#5E0505', 
    secondary: '#B3912E', 
    text: '#111111', 
    border: '#B3912E',
    fontMain: "'Playfair Display', serif",
    fontDisplay: "'Cinzel', serif",
    radius: '0px',
    borderWidth: '1.5px',
    textGlow: 'none',
  },
  [Atmosphere.TACTICAL_HUD]: {
    bg: '#020408', 
    surface: 'rgba(6, 10, 18, 0.98)', 
    accent: '#00F2FF', 
    secondary: '#3B82F6', 
    text: '#F0FFFF', 
    border: 'rgba(0, 242, 255, 0.6)', 
    fontMain: "'Exo 2', sans-serif",
    fontDisplay: "'Michroma', sans-serif",
    radius: '10px',
    borderWidth: '1px',
    showScanlines: true,
    textGlow: '0 0 10px rgba(0, 242, 255, 0.5)', 
  },
  [Atmosphere.FIELD_UNIT]: {
    bg: '#0C1208', 
    surface: '#151D0F',
    accent: '#FFD700', 
    secondary: '#E53E3E', 
    text: '#F7FAFC', 
    border: '#FFD700',
    fontMain: "'Courier Prime', monospace",
    fontDisplay: "'Arvo', serif",
    radius: '4px',
    borderWidth: '3px',
    flicker: true,
    textGlow: 'none',
  },
  [Atmosphere.CORE_TERMINAL]: {
    bg: '#000000',
    surface: '#080808',
    accent: '#FFA000', 
    secondary: '#FFA000',
    text: '#FFA000',
    border: '#FFA000',
    fontMain: "'JetBrains Mono', monospace",
    fontDisplay: "'JetBrains Mono', monospace",
    radius: '0px',
    borderWidth: '1px',
    textGlow: '0 0 18px rgba(255, 160, 0, 0.7)', 
  }
};

export const RANKS = [
  { minXp: 0, title: 'NOVICE' },
  { minXp: 500, title: 'OPERATIVE' },
  { minXp: 1500, title: 'SPECIALIST' },
  { minXp: 4000, title: 'ARCHITECT' },
  { minXp: 10000, title: 'SOVEREIGN' },
];
