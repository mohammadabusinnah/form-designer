import { useState, useMemo } from 'react';
import { CONTROL_REGISTRY, CATEGORY_LABELS, type ControlMeta } from '../../../controls/registry';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import * as Icons from '@/lib/icons';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '../../../utils/cn';

function ToolboxItem({ meta }: { meta: ControlMeta }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `toolbox-${meta.type}`,
    data: { fromToolbox: true, controlType: meta.type },
  });
  const Icon = (Icons as any)[meta.icon] ?? Icons.Box;
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md cursor-grab text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors select-none',
        isDragging && 'opacity-40'
      )}
    >
      <Icon size={14} className="shrink-0 text-gray-400" />
      <span className="truncate">{meta.label}</span>
    </div>
  );
}

function Category({ name, items }: { name: string; items: ControlMeta[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 bg-indigo-50 border-l-2 border-indigo-400 text-xs font-bold text-gray-700 uppercase tracking-widest hover:bg-indigo-100 transition-colors sticky top-0 z-10"
      >
        {open
          ? <ChevronDown size={11} className="text-indigo-400 shrink-0" />
          : <ChevronRight size={11} className="text-indigo-400 shrink-0" />}
        {name}
        <span className="ml-auto text-indigo-300 font-normal normal-case tracking-normal">{items.length}</span>
      </button>
      {open && (
        <div className="pb-1 pt-0.5">
          {items.map(m => <ToolboxItem key={m.type} meta={m} />)}
        </div>
      )}
    </div>
  );
}

export function Toolbox() {
  const [search, setSearch] = useState('');
  const categories = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = CONTROL_REGISTRY.filter(m => !q || m.label.toLowerCase().includes(q) || m.type.includes(q));
    const map: Record<string, ControlMeta[]> = {};
    for (const m of filtered) {
      if (!map[m.category]) map[m.category] = [];
      map[m.category].push(m);
    }
    return map;
  }, [search]);

  const groups = Object.entries(categories);

  return (
    <div className="w-56 shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search fields…"
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 overflow-y-auto py-2">
        {groups.map(([cat, items]) => (
          <Category key={cat} name={CATEGORY_LABELS[cat] ?? cat} items={items} />
        ))}
        {groups.length === 0 && (
          <div className="text-center text-xs text-gray-400 py-8">No fields match</div>
        )}
      </div>
    </div>
  );
}
