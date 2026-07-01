import { useDesignerStore } from '../../../store/designerStore';
import { FormSettings } from './FormSettings';
import { FieldProperties } from './FieldProperties';
import { collectAllElements } from '../../../utils/schemaHelpers';
import type { FormElement } from '../../../types/schema';

export function PropertiesPanel() {
  const { schema, selectedIds } = useDesignerStore();
  const allElements = collectAllElements(schema.pages);

  const selected: FormElement[] = selectedIds
    .map(id => allElements.find(e => e.id === id))
    .filter(Boolean) as FormElement[];

  return (
    <div className="w-72 shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 shrink-0">
        <h3 className="text-sm font-semibold text-gray-700">
          {selected.length === 0 ? 'Form Settings' : selected.length === 1 ? 'Properties' : `${selected.length} fields selected`}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {selected.length === 0 && <FormSettings />}
        {selected.length === 1 && <FieldProperties element={selected[0]} />}
        {selected.length > 1 && <MultiSelectProperties elements={selected} />}
      </div>
    </div>
  );
}

function MultiSelectProperties({ elements }: { elements: FormElement[] }) {
  const { updateElement } = useDesignerStore();
  const setAll = (patch: Partial<FormElement>) => elements.forEach(e => updateElement(e.id, patch));

  return (
    <div className="p-4 space-y-4">
      <div className="text-xs text-gray-500 bg-blue-50 rounded p-2 border border-blue-100">
        Editing {elements.length} fields simultaneously. Changes apply to all.
      </div>
      <Section title="Appearance">
        <WidthSelector onChange={w => setAll({ style: { width: w } })} />
        <LabelPositionSelect onChange={pos => setAll({ style: { labelPosition: pos } })} />
      </Section>
      <Section title="Behavior">
        <ToggleRow label="Required" onChange={v => setAll({ required: v } as any)} />
        <ToggleRow label="Read Only" onChange={v => setAll({ readOnly: v } as any)} />
        <ToggleRow label="Visible" defaultOn onChange={v => setAll({ visible: v } as any)} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function WidthSelector({ onChange }: { onChange: (w: string) => void }) {
  const widths = ['25%','33%','50%','66%','75%','100%'];
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">Width</label>
      <div className="grid grid-cols-6 gap-0.5">
        {widths.map(w => (
          <button key={w} onClick={() => onChange(w)} className="py-1 border border-gray-200 rounded text-xs text-gray-500 hover:border-indigo-400 hover:text-indigo-600">
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

function LabelPositionSelect({ onChange }: { onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">Label Position</label>
      <select onChange={e => onChange(e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-xs">
        <option value="top">Top</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
        <option value="hidden">Hidden</option>
        <option value="floating">Floating</option>
      </select>
    </div>
  );
}

function ToggleRow({ label, defaultOn, onChange }: { label: string; defaultOn?: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between text-xs text-gray-600">
      {label}
      <input type="checkbox" defaultChecked={defaultOn} onChange={e => onChange(e.target.checked)} className="rounded" />
    </label>
  );
}
