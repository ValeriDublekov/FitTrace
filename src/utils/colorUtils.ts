import { useTranslation } from 'react-i18next';

export interface ColorScheme {
  bg: string;
  text: string;
  border: string;
}

// Predefined premium color schemes for different muscle groups
const PRESETS: Record<string, ColorScheme> = {
  chest: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
  гърди: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
  
  back: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  гръб: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  
  legs: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  крака: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  
  shoulders: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  рамене: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  
  biceps: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
  бицепс: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
  
  triceps: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-100' },
  трицепс: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-100' },
  
  core: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100' },
  корем: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100' },
  
  cardio: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100' },
  кардио: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100' },
  
  'full body': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
  full_body: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
  'цяло тяло': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
  цялостно: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
};

// Generous list of fallback distinct color schemes
const PALETTES: ColorScheme[] = [
  { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
  { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
  { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
  { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100' },
  { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100' },
  { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-100' },
  { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100' },
];

/**
 * Deterministic hash-code calculation for string
 */
function getHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * Returns a beautiful, highly distinguishable ColorScheme tailored for a specific category or muscle group.
 * It is design-first and supports both English and Bulgarian labels.
 */
export function getCategoryColorScheme(category: string): ColorScheme {
  const normalized = category.trim().toLowerCase().replace('_', ' ');
  if (PRESETS[normalized]) {
    return PRESETS[normalized];
  }
  
  // Deterministic fallback based on hash of input text
  const index = getHashCode(normalized) % PALETTES.length;
  return PALETTES[index];
}

/**
 * Returns a beautiful, highly distinguishable ColorScheme for an arbitrary muscle zone (affectedPart).
 * We hash the string to assign a distinct color palette that matches perfectly.
 */
export function getZoneColorScheme(zone: string): ColorScheme {
  const normalized = zone.trim().toLowerCase();
  
  // Custom mapping if the zone relates directly to core categories
  for (const [key, preset] of Object.entries(PRESETS)) {
    if (normalized.includes(key)) {
      return preset;
    }
  }

  // Fallback to deterministic hash so distinct zones get different colors reliably
  const index = (getHashCode(normalized) + 3) % PALETTES.length; // offset slightly to minimize collisions with parent category
  return PALETTES[index];
}

export interface SortableExercise {
  category: string;
  name: string;
}

/**
 * Standard exercise sorter: sorts exercises first by muscle group (category) and then by name.
 */
export function sortExercises<T extends SortableExercise>(exercisesList: T[]): T[] {
  return [...exercisesList].sort((a, b) => {
    const catA = (a.category || '').toLowerCase();
    const catB = (b.category || '').toLowerCase();
    const catCompare = catA.localeCompare(catB);
    if (catCompare !== 0) return catCompare;
    
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

