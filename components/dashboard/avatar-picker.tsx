'use client';

import { useState } from 'react';
import {
  AvatarCharacter,
  type AvatarConfig,
  type AvatarCharacterId,
  type SkinTone,
  type HatStyle,
  type ShirtStyle,
  type GlassesStyle,
  type EarringStyle,
  DEFAULT_AVATAR_CONFIG,
} from '@/components/ui/avatar-character';

const CHARACTERS: { id: AvatarCharacterId; name: string }[] = [
  { id: 'm1', name: 'Marcus' },
  { id: 'm2', name: 'Jordan' },
  { id: 'm3', name: 'Ravi' },
  { id: 'm4', name: 'Kai' },
  { id: 'f1', name: 'Sophia' },
  { id: 'f2', name: 'Zara' },
  { id: 'f3', name: 'Maya' },
  { id: 'f4', name: 'Priya' },
];

const SKIN_TONES: { id: SkinTone; hex: string }[] = [
  { id: 'light', hex: '#FFDBB8' },
  { id: 'medium-light', hex: '#F0C894' },
  { id: 'medium', hex: '#D4A057' },
  { id: 'medium-dark', hex: '#A0713A' },
  { id: 'dark', hex: '#614028' },
  { id: 'deep', hex: '#3D2314' },
];

const HAIR_COLORS = ['#1a0a00', '#3d2314', '#7a4a1e', '#c47a2a', '#e8c870', '#d4d4d4', '#2a1f4a', '#c42a5a'];

const HATS: { id: HatStyle; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'cap', label: 'Cap' },
  { id: 'beanie', label: 'Beanie' },
  { id: 'fedora', label: 'Fedora' },
  { id: 'beret', label: 'Beret' },
  { id: 'crown', label: 'Crown' },
  { id: 'headband', label: 'Band' },
  { id: 'snapback', label: 'Snap' },
];

const SHIRTS: { id: ShirtStyle; label: string }[] = [
  { id: 'crew', label: 'Crew' },
  { id: 'collar', label: 'Collar' },
  { id: 'turtleneck', label: 'Turtle' },
  { id: 'vneck', label: 'V-Neck' },
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'blazer', label: 'Blazer' },
  { id: 'tank', label: 'Tank' },
  { id: 'stripes', label: 'Stripes' },
];

const GLASSES: { id: GlassesStyle; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'round', label: 'Round' },
  { id: 'square', label: 'Square' },
  { id: 'cat', label: 'Cat' },
  { id: 'aviator', label: 'Aviator' },
  { id: 'rimless', label: 'Rimless' },
];

const EARRINGS: { id: EarringStyle; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'studs', label: 'Studs' },
  { id: 'hoops', label: 'Hoops' },
  { id: 'drops', label: 'Drops' },
  { id: 'bar', label: 'Bar' },
];

const SHIRT_COLORS = ['#00c4a8', '#9c6bff', '#ff3cac', '#f59e0b', '#38bdf8', '#ef4444', '#22c55e', '#f97316', '#0ea5e9', '#8b5cf6'];

interface Props {
  value: Partial<AvatarConfig>;
  onChange: (config: Partial<AvatarConfig>) => void;
  accentColor?: string;
}

export function AvatarPicker({ value, onChange, accentColor = '#00e5cc' }: Props) {
  const config: AvatarConfig = { ...DEFAULT_AVATAR_CONFIG, ...value, accentColor };

  function set<K extends keyof AvatarConfig>(key: K, val: AvatarConfig[K]) {
    onChange({ ...config, [key]: val });
  }

  const isFemale = config.character.startsWith('f');

  return (
    <div className="space-y-6">
      {/* Live preview */}
      <div className="flex justify-center">
        <div className="relative">
          <AvatarCharacter config={config} size={120} />
        </div>
      </div>

      {/* Character selection */}
      <Section label="Character">
        <div className="grid grid-cols-4 gap-2">
          {CHARACTERS.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => set('character', ch.id)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all"
              style={{
                background: config.character === ch.id ? `${accentColor}15` : 'rgba(12,26,31,0.5)',
                border: `1px solid ${config.character === ch.id ? accentColor : 'rgba(0,229,204,0.1)'}`,
              }}
            >
              <AvatarCharacter config={{ ...config, character: ch.id }} size={44} />
              <span className="text-[9px] font-semibold leading-none" style={{ color: config.character === ch.id ? accentColor : '#4d7a90' }}>
                {ch.name}
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* Skin tone */}
      <Section label="Skin Tone">
        <div className="flex gap-2 flex-wrap">
          {SKIN_TONES.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => set('skinTone', st.id)}
              className="w-8 h-8 rounded-full transition-all"
              style={{
                background: st.hex,
                outline: config.skinTone === st.id ? `2px solid ${accentColor}` : '2px solid transparent',
                outlineOffset: '2px',
              }}
              aria-label={st.id}
            />
          ))}
        </div>
      </Section>

      {/* Hair color */}
      <Section label="Hair Color">
        <div className="flex gap-2 flex-wrap">
          {HAIR_COLORS.map((hc) => (
            <button
              key={hc}
              type="button"
              onClick={() => set('hairColor', hc)}
              className="w-7 h-7 rounded-full transition-all"
              style={{
                background: hc,
                outline: config.hairColor === hc ? `2px solid ${accentColor}` : '2px solid transparent',
                outlineOffset: '2px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              aria-label={hc}
            />
          ))}
        </div>
      </Section>

      {/* Hat */}
      <Section label="Hat">
        <div className="grid grid-cols-4 gap-1.5">
          {HATS.map((h) => (
            <ChipButton key={h.id} active={config.hat === h.id} onClick={() => set('hat', h.id)} accentColor={accentColor}>
              {h.label}
            </ChipButton>
          ))}
        </div>
      </Section>

      {/* Shirt style */}
      <Section label="Top">
        <div className="grid grid-cols-4 gap-1.5">
          {SHIRTS.map((s) => (
            <ChipButton key={s.id} active={config.shirt === s.id} onClick={() => set('shirt', s.id)} accentColor={accentColor}>
              {s.label}
            </ChipButton>
          ))}
        </div>
      </Section>

      {/* Shirt color */}
      <Section label="Top Color">
        <div className="flex gap-2 flex-wrap">
          {SHIRT_COLORS.map((sc) => (
            <button
              key={sc}
              type="button"
              onClick={() => set('shirtColor', sc)}
              className="w-7 h-7 rounded-full transition-all"
              style={{
                background: sc,
                outline: config.shirtColor === sc ? `2px solid ${accentColor}` : '2px solid transparent',
                outlineOffset: '2px',
              }}
              aria-label={sc}
            />
          ))}
        </div>
      </Section>

      {/* Glasses */}
      <Section label="Glasses">
        <div className="grid grid-cols-3 gap-1.5">
          {GLASSES.map((g) => (
            <ChipButton key={g.id} active={config.glasses === g.id} onClick={() => set('glasses', g.id)} accentColor={accentColor}>
              {g.label}
            </ChipButton>
          ))}
        </div>
      </Section>

      {/* Earrings — always visible, note female characters only */}
      <Section label={`Earrings${!isFemale ? ' (female characters)' : ''}`}>
        <div className="grid grid-cols-5 gap-1.5">
          {EARRINGS.map((e) => (
            <ChipButton
              key={e.id}
              active={config.earrings === e.id}
              onClick={() => set('earrings', e.id)}
              accentColor={accentColor}
              disabled={!isFemale && e.id !== 'none'}
            >
              {e.label}
            </ChipButton>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4d7a90', fontFamily: "var(--font-label, 'Bebas Neue')" }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  accentColor,
  children,
  disabled = false,
}: {
  active: boolean;
  onClick: () => void;
  accentColor: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
      style={{
        background: active ? `${accentColor}18` : 'rgba(12,26,31,0.5)',
        border: `1px solid ${active ? accentColor : 'rgba(0,229,204,0.08)'}`,
        color: active ? accentColor : disabled ? '#2d5268' : '#4d7a90',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}
