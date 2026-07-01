import { useDesignerStore } from '../../store/designerStore';
import { Undo2, Redo2, Eye, Save, Languages } from 'lucide-react';
import { cn } from '../../utils/cn';

const WIDTH_PRESETS = [
  { label: 'S', title: 'Narrow — 600px', value: 600 },
  { label: 'M', title: 'Standard — 768px', value: 768 },
  { label: 'L', title: 'Wide — 1024px', value: 1024 },
];

export function Toolbar() {
  const {
    schema, isDirty, setTitle, setDirection, undo, redo, past, future,
    setPreviewMode, previewMode, canvasWidth, setCanvasWidth,
  } = useDesignerStore();

  return (
    <div className="h-12 border-b border-gray-200 bg-white flex items-center px-4 gap-3 shrink-0 z-10">
      {/* Title */}
      <input
        className="font-semibold text-sm bg-transparent border-none outline-none text-gray-800 w-48 min-w-0 truncate focus:bg-gray-50 rounded px-1"
        value={schema.title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Form title"
      />

      <div className="w-px h-5 bg-gray-200" />

      {/* Direction */}
      <div className="flex items-center gap-1 text-xs text-gray-600">
        <Languages size={14} className="text-gray-400" />
        <button
          onClick={() => setDirection(schema.direction === 'ltr' ? 'rtl' : 'ltr')}
          className={cn(
            'px-2 py-1 rounded text-xs font-medium transition-colors',
            schema.direction === 'ltr' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'
          )}
        >
          {schema.direction.toUpperCase()}
        </button>
      </div>

      <div className="w-px h-5 bg-gray-200" />

      {/* Undo / Redo */}
      <button onClick={undo} disabled={!past.length} title="Undo (Ctrl+Z)"
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600">
        <Undo2 size={16} />
      </button>
      <button onClick={redo} disabled={!future.length} title="Redo (Ctrl+Y)"
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-600">
        <Redo2 size={16} />
      </button>

      <div className="w-px h-5 bg-gray-200" />

      {/* Canvas width */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400 shrink-0">Width</span>
        {/* Presets */}
        <div className="flex items-center bg-gray-100 rounded p-0.5">
          {WIDTH_PRESETS.map(p => (
            <button
              key={p.value}
              title={p.title}
              onClick={() => setCanvasWidth(p.value)}
              className={cn(
                'w-6 h-6 rounded text-xs font-semibold transition-colors',
                canvasWidth === p.value ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        {/* Custom width input */}
        <input
          type="number" min={320} max={1920} step={8}
          value={canvasWidth}
          onChange={e => setCanvasWidth(Number(e.target.value))}
          className="w-16 text-xs input-base py-0.5 px-1.5"
        />
      </div>

      <div className="flex-1" />

      {/* Dirty indicator */}
      {isDirty && <span className="text-xs text-amber-500 font-medium">Unsaved</span>}

      {/* Preview */}
      <button
        onClick={() => setPreviewMode(!previewMode)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
          previewMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        )}
      >
        <Eye size={14} />
        {previewMode ? 'Exit Preview' : 'Preview'}
      </button>

      {/* Save */}
      <button
        onClick={() => {}}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
      >
        <Save size={14} />
        Save
      </button>
    </div>
  );
}
