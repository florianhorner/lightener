export interface PresetDef {
  id: string;
  name: string;
  description: string;
  controlPoints: Array<{ lightener: number; target: number }>;
}

export const CURVE_PRESETS: PresetDef[] = [
  {
    id: 'linear',
    name: 'Linear',
    description: 'Equal brightness — what you set is what you get.',
    controlPoints: [
      { lightener: 0, target: 0 },
      { lightener: 1, target: 1 },
      { lightener: 100, target: 100 },
    ],
  },
  {
    id: 'dim_accent',
    name: 'Dim accent',
    description: 'Caps at ~45% max — great for mood or accent lighting.',
    controlPoints: [
      { lightener: 0, target: 0 },
      { lightener: 1, target: 1 },
      { lightener: 25, target: 8 },
      { lightener: 50, target: 20 },
      { lightener: 100, target: 45 },
    ],
  },
  {
    id: 'late_starter',
    name: 'Late starter',
    description: 'Stays very dim until ~45%, then brightens quickly.',
    controlPoints: [
      { lightener: 0, target: 0 },
      { lightener: 1, target: 1 },
      { lightener: 45, target: 1 },
      { lightener: 70, target: 45 },
      { lightener: 100, target: 100 },
    ],
  },
  {
    id: 'night_mode',
    name: 'Night mode',
    description: 'Caps at ~25% — barely bright even at full Lightener level.',
    controlPoints: [
      { lightener: 0, target: 0 },
      { lightener: 1, target: 1 },
      { lightener: 20, target: 3 },
      { lightener: 50, target: 10 },
      { lightener: 100, target: 25 },
    ],
  },
];

export function presetPolylinePoints(preset: PresetDef): string {
  const W = 64;
  const H = 40;
  const pad = 4;
  return preset.controlPoints
    .map((cp) => {
      const x = pad + (cp.lightener / 100) * (W - 2 * pad);
      const y = H - pad - (cp.target / 100) * (H - 2 * pad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}
