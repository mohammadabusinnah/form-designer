import { useState, useRef, useEffect } from 'react';
import { useDesignerStore } from '../../../store/designerStore';
import type { FormTheme } from '../../../types/schema';
import { Search, ChevronDown, CheckCircle as Check } from '@/lib/icons';

// ── 50 themes ───────────────────────────────────────────────────────────────
interface ThemeDef extends FormTheme {
  id: string;
  name: string;
  group: string;
}

const THEMES: ThemeDef[] = [
  // ── Classic ──────────────────────────────────────────────────────────────
  { id: 'default-indigo',    name: 'Default Indigo',    group: 'Classic',  preset: 'custom', primaryColor: '#6366f1', labelColor: '#1e1b4b', fieldBackground: '#ffffff', borderColor: '#c7d2fe', borderRadius: 6,  fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },
  { id: 'corporate-navy',    name: 'Corporate Navy',    group: 'Classic',  preset: 'custom', primaryColor: '#1e3a5f', labelColor: '#0f172a', fieldBackground: '#f8fafc', borderColor: '#cbd5e1', borderRadius: 4,  fontSize: 'md', density: 'compact',     fontFamily: 'Inter, sans-serif' },
  { id: 'classic-charcoal',  name: 'Classic Charcoal',  group: 'Classic',  preset: 'custom', primaryColor: '#374151', labelColor: '#111827', fieldBackground: '#ffffff', borderColor: '#d1d5db', borderRadius: 4,  fontSize: 'md', density: 'normal',      fontFamily: 'Georgia, serif' },
  { id: 'slate-pro',         name: 'Slate Pro',         group: 'Classic',  preset: 'custom', primaryColor: '#475569', labelColor: '#1e293b', fieldBackground: '#f8fafc', borderColor: '#e2e8f0', borderRadius: 6,  fontSize: 'md', density: 'comfortable', fontFamily: 'Inter, sans-serif' },
  { id: 'midnight-blue',     name: 'Midnight Blue',     group: 'Classic',  preset: 'custom', primaryColor: '#1d4ed8', labelColor: '#1e3a5f', fieldBackground: '#eff6ff', borderColor: '#bfdbfe', borderRadius: 6,  fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },

  // ── Vibrant ───────────────────────────────────────────────────────────────
  { id: 'electric-violet',   name: 'Electric Violet',   group: 'Vibrant',  preset: 'custom', primaryColor: '#7c3aed', labelColor: '#2e1065', fieldBackground: '#faf5ff', borderColor: '#ddd6fe', borderRadius: 8,  fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },
  { id: 'hot-pink',          name: 'Hot Pink',          group: 'Vibrant',  preset: 'custom', primaryColor: '#ec4899', labelColor: '#500724', fieldBackground: '#fff1f2', borderColor: '#fecdd3', borderRadius: 8,  fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },
  { id: 'sunset-orange',     name: 'Sunset Orange',     group: 'Vibrant',  preset: 'custom', primaryColor: '#f97316', labelColor: '#7c2d12', fieldBackground: '#fff7ed', borderColor: '#fed7aa', borderRadius: 8,  fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },
  { id: 'neon-cyan',         name: 'Neon Cyan',         group: 'Vibrant',  preset: 'custom', primaryColor: '#06b6d4', labelColor: '#164e63', fieldBackground: '#ecfeff', borderColor: '#a5f3fc', borderRadius: 10, fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },
  { id: 'lime-burst',        name: 'Lime Burst',        group: 'Vibrant',  preset: 'custom', primaryColor: '#84cc16', labelColor: '#1a2e05', fieldBackground: '#f7fee7', borderColor: '#bbf7d0', borderRadius: 8,  fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },
  { id: 'crimson-fire',      name: 'Crimson Fire',      group: 'Vibrant',  preset: 'custom', primaryColor: '#dc2626', labelColor: '#450a0a', fieldBackground: '#fff5f5', borderColor: '#fecaca', borderRadius: 6,  fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },
  { id: 'magenta-pop',       name: 'Magenta Pop',       group: 'Vibrant',  preset: 'custom', primaryColor: '#a855f7', labelColor: '#3b0764', fieldBackground: '#fdf4ff', borderColor: '#e9d5ff', borderRadius: 10, fontSize: 'md', density: 'comfortable', fontFamily: 'Inter, sans-serif' },
  { id: 'golden-amber',      name: 'Golden Amber',      group: 'Vibrant',  preset: 'custom', primaryColor: '#d97706', labelColor: '#451a03', fieldBackground: '#fffbeb', borderColor: '#fde68a', borderRadius: 6,  fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },

  // ── Nature ────────────────────────────────────────────────────────────────
  { id: 'emerald-fresh',     name: 'Emerald Fresh',     group: 'Nature',   preset: 'custom', primaryColor: '#059669', labelColor: '#022c22', fieldBackground: '#ecfdf5', borderColor: '#a7f3d0', borderRadius: 8,  fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },
  { id: 'ocean-breeze',      name: 'Ocean Breeze',      group: 'Nature',   preset: 'custom', primaryColor: '#0ea5e9', labelColor: '#0c4a6e', fieldBackground: '#f0f9ff', borderColor: '#bae6fd', borderRadius: 8,  fontSize: 'md', density: 'comfortable', fontFamily: 'Inter, sans-serif' },
  { id: 'earth-clay',        name: 'Earth Clay',        group: 'Nature',   preset: 'custom', primaryColor: '#92400e', labelColor: '#3b1207', fieldBackground: '#fefce8', borderColor: '#fde68a', borderRadius: 4,  fontSize: 'md', density: 'normal',      fontFamily: 'Georgia, serif' },
  { id: 'lavender-mist',     name: 'Lavender Mist',     group: 'Nature',   preset: 'custom', primaryColor: '#8b5cf6', labelColor: '#2e1065', fieldBackground: '#fdf4ff', borderColor: '#e9d5ff', borderRadius: 12, fontSize: 'md', density: 'comfortable', fontFamily: 'Inter, sans-serif' },

  // ── Soft ──────────────────────────────────────────────────────────────────
  { id: 'soft-rose',         name: 'Soft Rose',         group: 'Soft',     preset: 'custom', primaryColor: '#fb7185', labelColor: '#881337', fieldBackground: '#fff1f2', borderColor: '#fecdd3', borderRadius: 12, fontSize: 'md', density: 'comfortable', fontFamily: 'Georgia, serif' },
  { id: 'powder-blue',       name: 'Powder Blue',       group: 'Soft',     preset: 'custom', primaryColor: '#60a5fa', labelColor: '#1e3a5f', fieldBackground: '#eff6ff', borderColor: '#bfdbfe', borderRadius: 12, fontSize: 'md', density: 'comfortable', fontFamily: 'Inter, sans-serif' },
  { id: 'peach-cream',       name: 'Peach Cream',       group: 'Soft',     preset: 'custom', primaryColor: '#fb923c', labelColor: '#7c2d12', fieldBackground: '#fff7ed', borderColor: '#fed7aa', borderRadius: 14, fontSize: 'md', density: 'comfortable', fontFamily: 'Georgia, serif' },
  { id: 'mint-fresh',        name: 'Mint Fresh',        group: 'Soft',     preset: 'custom', primaryColor: '#34d399', labelColor: '#022c22', fieldBackground: '#ecfdf5', borderColor: '#a7f3d0', borderRadius: 12, fontSize: 'md', density: 'comfortable', fontFamily: 'Inter, sans-serif' },
  { id: 'lilac-dream',       name: 'Lilac Dream',       group: 'Soft',     preset: 'custom', primaryColor: '#c084fc', labelColor: '#3b0764', fieldBackground: '#fdf4ff', borderColor: '#e9d5ff', borderRadius: 16, fontSize: 'lg', density: 'comfortable', fontFamily: 'Georgia, serif' },

  // ── Dark ──────────────────────────────────────────────────────────────────
  { id: 'dark-slate',        name: 'Dark Slate',        group: 'Dark',     preset: 'custom', primaryColor: '#818cf8', labelColor: '#e0e7ff', fieldBackground: '#1e293b', borderColor: '#334155', borderRadius: 6,  fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },
  { id: 'dark-charcoal',     name: 'Dark Charcoal',     group: 'Dark',     preset: 'custom', primaryColor: '#a3a3a3', labelColor: '#f5f5f5', fieldBackground: '#1c1c1c', borderColor: '#3f3f3f', borderRadius: 4,  fontSize: 'md', density: 'compact',     fontFamily: 'Inter, sans-serif' },
  { id: 'dark-violet',       name: 'Dark Violet',       group: 'Dark',     preset: 'custom', primaryColor: '#a855f7', labelColor: '#f3e8ff', fieldBackground: '#1a0533', borderColor: '#4c1d95', borderRadius: 8,  fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },
  { id: 'dark-ocean',        name: 'Dark Ocean',        group: 'Dark',     preset: 'custom', primaryColor: '#38bdf8', labelColor: '#e0f2fe', fieldBackground: '#0c1e35', borderColor: '#1e3a5f', borderRadius: 8,  fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },
  { id: 'dark-emerald',      name: 'Dark Emerald',      group: 'Dark',     preset: 'custom', primaryColor: '#34d399', labelColor: '#d1fae5', fieldBackground: '#022c22', borderColor: '#064e3b', borderRadius: 6,  fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },
  { id: 'dark-crimson',      name: 'Dark Crimson',      group: 'Dark',     preset: 'custom', primaryColor: '#f87171', labelColor: '#fee2e2', fieldBackground: '#1a0000', borderColor: '#450a0a', borderRadius: 6,  fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },

  // ── Pro ───────────────────────────────────────────────────────────────────
  { id: 'high-contrast',     name: 'High Contrast',     group: 'Pro',      preset: 'custom', primaryColor: '#000000', labelColor: '#000000', fieldBackground: '#ffffff', borderColor: '#000000', borderRadius: 0,  fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },
  { id: 'monochrome-minimal',name: 'Monochrome Minimal', group: 'Pro',     preset: 'custom', primaryColor: '#374151', labelColor: '#111827', fieldBackground: '#f9fafb', borderColor: '#e5e7eb', borderRadius: 2,  fontSize: 'sm', density: 'compact',     fontFamily: 'Inter, sans-serif' },
  { id: 'print-ready',       name: 'Print Ready',       group: 'Pro',      preset: 'custom', primaryColor: '#1e3a5f', labelColor: '#111827', fieldBackground: '#ffffff', borderColor: '#9ca3af', borderRadius: 0,  fontSize: 'sm', density: 'compact',     fontFamily: 'Times New Roman, serif' },
  { id: 'executive-dark',    name: 'Executive Dark',    group: 'Pro',      preset: 'custom', primaryColor: '#c9a84c', labelColor: '#fef3c7', fieldBackground: '#1a1a2e', borderColor: '#c9a84c', borderRadius: 4,  fontSize: 'md', density: 'comfortable', fontFamily: 'Georgia, serif' },
  { id: 'neon-terminal',     name: 'Neon Terminal',     group: 'Pro',      preset: 'custom', primaryColor: '#00ff41', labelColor: '#00ff41', fieldBackground: '#0d0d0d', borderColor: '#00ff41', borderRadius: 0,  fontSize: 'md', density: 'compact',     fontFamily: 'Courier New, monospace' },

  // ── Trendy ────────────────────────────────────────────────────────────────
  { id: 'glassmorphism',     name: 'Glassmorphism',     group: 'Trendy',   preset: 'custom', primaryColor: '#8b5cf6', labelColor: '#312e81', fieldBackground: '#ffffff80', borderColor: '#c4b5fd', borderRadius: 16, fontSize: 'md', density: 'comfortable', fontFamily: 'Inter, sans-serif' },
  { id: 'neumorphic-light',  name: 'Neumorphic Light',  group: 'Trendy',   preset: 'custom', primaryColor: '#6366f1', labelColor: '#374151', fieldBackground: '#e0e5ec', borderColor: '#e0e5ec', borderRadius: 12, fontSize: 'md', density: 'comfortable', fontFamily: 'Inter, sans-serif' },
  { id: 'y2k-retro',         name: 'Y2K Retro',         group: 'Trendy',   preset: 'custom', primaryColor: '#ff00ff', labelColor: '#00008b', fieldBackground: '#fffacd', borderColor: '#ff69b4', borderRadius: 0,  fontSize: 'md', density: 'normal',      fontFamily: 'Courier New, monospace' },
  { id: 'brutalist',         name: 'Brutalist',         group: 'Trendy',   preset: 'custom', primaryColor: '#000000', labelColor: '#000000', fieldBackground: '#ffff00', borderColor: '#000000', borderRadius: 0,  fontSize: 'lg', density: 'comfortable', fontFamily: 'Arial Black, sans-serif' },
  { id: 'pastel-candy',      name: 'Pastel Candy',      group: 'Trendy',   preset: 'custom', primaryColor: '#f9a8d4', labelColor: '#831843', fieldBackground: '#fff0f8', borderColor: '#fbcfe8', borderRadius: 20, fontSize: 'md', density: 'comfortable', fontFamily: 'Georgia, serif' },

  // ── Regional ──────────────────────────────────────────────────────────────
  { id: 'arabic-classic',    name: 'Arabic Classic',    group: 'Regional', preset: 'custom', primaryColor: '#b45309', labelColor: '#1c1917', fieldBackground: '#fffbeb', borderColor: '#fde68a', borderRadius: 4,  fontSize: 'md', density: 'comfortable', fontFamily: 'Amiri, Georgia, serif' },
  { id: 'arabic-modern',     name: 'Arabic Modern',     group: 'Regional', preset: 'custom', primaryColor: '#0f766e', labelColor: '#042f2e', fieldBackground: '#f0fdfa', borderColor: '#99f6e4', borderRadius: 6,  fontSize: 'md', density: 'normal',      fontFamily: 'Tajawal, Inter, sans-serif' },
  { id: 'japanese-zen',      name: 'Japanese Zen',      group: 'Regional', preset: 'custom', primaryColor: '#be123c', labelColor: '#1c1917', fieldBackground: '#fafaf9', borderColor: '#e7e5e4', borderRadius: 0,  fontSize: 'sm', density: 'comfortable', fontFamily: 'Georgia, serif' },
  { id: 'scandinavian',      name: 'Scandinavian',      group: 'Regional', preset: 'custom', primaryColor: '#0369a1', labelColor: '#0c4a6e', fieldBackground: '#f0f9ff', borderColor: '#bae6fd', borderRadius: 4,  fontSize: 'md', density: 'normal',      fontFamily: 'Inter, sans-serif' },
  { id: 'mediterranean',     name: 'Mediterranean',     group: 'Regional', preset: 'custom', primaryColor: '#b45309', labelColor: '#1c1917', fieldBackground: '#fffbeb', borderColor: '#fcd34d', borderRadius: 8,  fontSize: 'md', density: 'normal',      fontFamily: 'Georgia, serif' },
];

// ── Theme Selector ───────────────────────────────────────────────────────────
function ThemeSelector() {
  const { schema, updateSchema } = useDesignerStore();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeTheme = THEMES.find(t =>
    t.primaryColor === schema.theme.primaryColor &&
    t.fieldBackground === schema.theme.fieldBackground &&
    t.borderColor === schema.theme.borderColor
  ) ?? THEMES[0];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? THEMES.filter(t => t.name.toLowerCase().includes(query.toLowerCase()) || t.group.toLowerCase().includes(query.toLowerCase()))
    : THEMES;

  const groups = Array.from(new Set(filtered.map(t => t.group)));

  function applyTheme(t: ThemeDef) {
    const { id: _id, name: _name, group: _group, ...theme } = t;
    updateSchema({ theme });
    setOpen(false);
    setQuery('');
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white hover:border-indigo-400 transition-colors text-sm"
      >
        {/* Color swatches */}
        <span className="flex gap-0.5 shrink-0">
          {[activeTheme.primaryColor, activeTheme.fieldBackground, activeTheme.borderColor, activeTheme.labelColor].map((c, i) => (
            <span key={i} style={{ background: c, width: 12, height: 12, borderRadius: 2, border: '1px solid #e5e7eb', display: 'inline-block' }} />
          ))}
        </span>
        <span className="flex-1 text-left text-gray-700">{activeTheme.name}</span>
        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{activeTheme.group}</span>
        <ChevronDown size={14} className="text-gray-400 shrink-0" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 shrink-0">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search themes…"
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          {/* List */}
          <div className="overflow-y-auto flex-1 p-1">
            {groups.map(group => (
              <div key={group}>
                <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider sticky top-0 bg-white">{group}</div>
                {filtered.filter(t => t.group === group).map(t => (
                  <button
                    key={t.id}
                    onClick={() => applyTheme(t)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors text-left"
                  >
                    <span className="flex gap-0.5 shrink-0">
                      {[t.primaryColor, t.fieldBackground, t.borderColor, t.labelColor].map((c, i) => (
                        <span key={i} style={{ background: c, width: 12, height: 12, borderRadius: 2, border: '1px solid #e5e7eb', display: 'inline-block' }} />
                      ))}
                    </span>
                    <span className="flex-1 text-xs text-gray-700">{t.name}</span>
                    {activeTheme.id === t.id && <Check size={12} className="text-indigo-600 shrink-0" />}
                  </button>
                ))}
              </div>
            ))}
            {filtered.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No themes match "{query}"</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ColorRow ─────────────────────────────────────────────────────────────────
function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-gray-400 uppercase">{value}</span>
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5 bg-white" />
      </div>
    </div>
  );
}

// ── FormSettings ─────────────────────────────────────────────────────────────
export function FormSettings() {
  const { schema, updateSchema } = useDesignerStore();
  const t = schema.theme;
  const updTheme = (patch: Partial<FormTheme>) => updateSchema({ theme: { ...t, ...patch } });

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full">
      {/* Theme picker */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Theme</h3>
        <ThemeSelector />
      </section>

      {/* Fine-tune */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fine-tune Colors</h3>
        <ColorRow label="Primary / Accent"   value={t.primaryColor}     onChange={v => updTheme({ primaryColor: v })} />
        <ColorRow label="Label Color"        value={t.labelColor}       onChange={v => updTheme({ labelColor: v })} />
        <ColorRow label="Field Background"   value={t.fieldBackground}  onChange={v => updTheme({ fieldBackground: v })} />
        <ColorRow label="Border Color"       value={t.borderColor}      onChange={v => updTheme({ borderColor: v })} />
      </section>

      {/* Typography */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Typography & Layout</h3>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Font Family</label>
          <select value={t.fontFamily ?? 'Inter, sans-serif'} onChange={e => updTheme({ fontFamily: e.target.value })} className="input-base text-xs">
            <option value="Inter, sans-serif">Inter (Default)</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Tajawal, Inter, sans-serif">Tajawal (Arabic)</option>
            <option value="Amiri, Georgia, serif">Amiri (Arabic)</option>
            <option value="Courier New, monospace">Courier New</option>
            <option value="Arial Black, sans-serif">Arial Black</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Font Size</label>
          <div className="flex rounded overflow-hidden border border-gray-200">
            {(['sm', 'md', 'lg'] as const).map(s => (
              <button key={s} onClick={() => updTheme({ fontSize: s })}
                className={`flex-1 py-1 text-xs font-medium transition-colors ${t.fontSize === s ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                {s === 'sm' ? 'Small' : s === 'md' ? 'Medium' : 'Large'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Density</label>
          <div className="flex rounded overflow-hidden border border-gray-200">
            {(['compact', 'normal', 'comfortable'] as const).map(d => (
              <button key={d} onClick={() => updTheme({ density: d })}
                className={`flex-1 py-1 text-xs font-medium transition-colors capitalize ${t.density === d ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Border Radius — {t.borderRadius ?? 6}px</label>
          <input type="range" min={0} max={24} value={t.borderRadius ?? 6}
            onChange={e => updTheme({ borderRadius: Number(e.target.value) })}
            className="w-full accent-indigo-600" />
        </div>
      </section>

      {/* Form metadata */}
      <section className="space-y-3 border-t border-gray-100 pt-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Form Metadata</h3>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Title</label>
          <input value={schema.title} onChange={e => updateSchema({ title: e.target.value })} className="input-base text-xs" placeholder="Form title" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Description</label>
          <textarea rows={2} value={schema.description ?? ''} onChange={e => updateSchema({ description: e.target.value })} className="input-base text-xs resize-none" placeholder="Optional description…" />
        </div>
      </section>
    </div>
  );
}
