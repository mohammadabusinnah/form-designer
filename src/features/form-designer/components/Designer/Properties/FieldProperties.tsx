import { useState, useContext, createContext } from 'react';
import { useDesignerStore } from '../../../store/designerStore';
import type { FormElement, FieldElement, StaticOption, StyleObject } from '../../../types/schema';
import { cn } from '../../../utils/cn';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { genId } from '../../../utils/idGenerator';

const TABS = ['General', 'Validation', 'Style', 'Logic', 'Data'] as const;
type Tab = typeof TABS[number];

export function FieldProperties({ element }: { element: FormElement }) {
  const [activeTab, setActiveTab] = useState<Tab>('General');
  const { updateElement, schema } = useDesignerStore();
  const upd = (patch: Partial<FormElement>) => updateElement(element.id, patch);

  const isField = !['section','columns','tabs','accordion','frame'].includes(element.type);

  const filteredTabs = TABS.filter(t => {
    if (t === 'Data' && !isField) return false;
    if (t === 'Validation' && !isField) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto shrink-0">
        {filteredTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors',
              activeTab === tab ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {activeTab === 'General' && <GeneralTab element={element} upd={upd} />}
        {activeTab === 'Validation' && isField && <ValidationTab element={element as FieldElement} upd={upd} />}
        {activeTab === 'Style' && <StyleTab element={element} upd={upd} />}
        {activeTab === 'Logic' && <LogicTab element={element} />}
        {activeTab === 'Data' && isField && <DataTab element={element as FieldElement} upd={upd} />}
      </div>
    </div>
  );
}

// ── General Tab ──────────────────────────────────────────────────────────────
function GeneralTab({ element, upd }: { element: FormElement; upd: (p: any) => void }) {
  const el = element as FieldElement;
  return (
    <PropProvider element={element} upd={upd}>
    <div className="space-y-3">
      {/* Label */}
      {'label' in element && (
        <Field label="Label" propKey="label">
          <input value={(el as any).label ?? ''} onChange={e => upd({ label: e.target.value })} className="input-base" />
        </Field>
      )}
      {/* Field name */}
      <Field label="Field Name / Key">
        <input value={element.name} onChange={e => upd({ name: e.target.value })} className="input-base font-mono text-xs" />
      </Field>
      {/* Default value — shown for all input controls (not layout/static) */}
      {!['section','columns','tabs','accordion','frame','heading','paragraph','divider','spacer','hidden',
          'richtext','signature','fileupload','calculated','aiextract','aisuggest','aisummary','confidence','datatable'].includes(element.type) && (
        <Field label="Default Value" propKey="defaultValue">
          {['longtext'].includes(element.type)
            ? <textarea rows={2} value={String(el.defaultValue ?? '')} onChange={e => upd({ defaultValue: e.target.value })} className="input-base resize-none text-xs" placeholder="Default text…" />
            : ['dropdown','multiselect','radio','checkbox','buttongroup'].includes(element.type)
            ? <input value={String(el.defaultValue ?? '')} onChange={e => upd({ defaultValue: e.target.value })} className="input-base text-xs" placeholder="Option value (e.g. opt_1)" />
            : ['number','currency','slider','rating','starrating'].includes(element.type)
            ? <input type="number" value={el.defaultValue != null ? Number(el.defaultValue) : ''} onChange={e => upd({ defaultValue: e.target.value ? Number(e.target.value) : undefined })} className="input-base" />
            : ['toggle','yesno'].includes(element.type)
            ? <select value={el.defaultValue != null ? String(el.defaultValue) : ''} onChange={e => upd({ defaultValue: e.target.value || undefined })} className="input-base">
                <option value="">— none —</option>
                <option value="true">On / Yes</option>
                <option value="false">Off / No</option>
              </select>
            : <input value={String(el.defaultValue ?? '')} onChange={e => upd({ defaultValue: e.target.value })} className="input-base" placeholder="Default value…" />
          }
        </Field>
      )}
      {/* Placeholder */}
      {'placeholder' in element && (
        <Field label="Placeholder" propKey="placeholder">
          <input value={el.placeholder ?? ''} onChange={e => upd({ placeholder: e.target.value })} className="input-base" />
        </Field>
      )}
      {/* Help text */}
      {'helpText' in element && (
        <Field label="Help Text" propKey="helpText">
          <input value={el.helpText ?? ''} onChange={e => upd({ helpText: e.target.value })} className="input-base" />
        </Field>
      )}
      {/* Tooltip */}
      {'tooltip' in element && (
        <Field label="Tooltip" propKey="tooltip">
          <input value={el.tooltip ?? ''} onChange={e => upd({ tooltip: e.target.value })} className="input-base" />
        </Field>
      )}
      {/* Width */}
      <Field label="Width">
        <WidthSelector value={element.style?.width ?? '100%'} onChange={w => upd({ style: { ...element.style, width: w } })} />
      </Field>
      {/* Label position */}
      {'label' in element && !['heading','paragraph','divider','spacer'].includes(element.type) && (
        <Field label="Label Position">
          <select value={el.style?.labelPosition ?? 'top'} onChange={e => upd({ style: { ...el.style, labelPosition: e.target.value as any } })} className="input-base">
            <option value="top">Top</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="hidden">Hidden</option>
            <option value="floating">Floating</option>
          </select>
        </Field>
      )}
      {/* Options editor for choice controls */}
      {['dropdown','multiselect','radio','checkbox','buttongroup'].includes(element.type) && (
        <OptionsEditor el={el} upd={upd} />
      )}
      {/* Section-specific */}
      {element.type === 'section' && (
        <>
          <Toggle label="Collapsible" propKey="collapsible" checked={(element as any).collapsible ?? false} onChange={v => upd({ collapsible: v })} />
          <Toggle label="Repeatable" propKey="repeatable" checked={(element as any).repeatable ?? false} onChange={v => upd({ repeatable: v })} />
        </>
      )}
      {/* Heading */}
      {element.type === 'heading' && (
        <>
          <Field label="Text"><input value={(el as any).text ?? ''} onChange={e => upd({ text: e.target.value })} className="input-base" /></Field>
          <Field label="Level">
            <select value={(el as any).level ?? 2} onChange={e => upd({ level: Number(e.target.value) })} className="input-base">
              {[1,2,3,4].map(l => <option key={l} value={l}>H{l}</option>)}
            </select>
          </Field>
        </>
      )}
      {/* Paragraph */}
      {element.type === 'paragraph' && (
        <Field label="Content">
          <textarea rows={3} value={(el as any).content ?? ''} onChange={e => upd({ content: e.target.value })} className="input-base resize-none" />
        </Field>
      )}
      {/* Toggle */}
      {element.type === 'toggle' && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="On Label"><input value={el.onLabel ?? 'Yes'} onChange={e => upd({ onLabel: e.target.value })} className="input-base" /></Field>
          <Field label="Off Label"><input value={el.offLabel ?? 'No'} onChange={e => upd({ offLabel: e.target.value })} className="input-base" /></Field>
        </div>
      )}
      {/* Number/Currency/Slider range */}
      {['number','currency','slider'].includes(element.type) && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Min"><input type="number" value={el.min ?? 0} onChange={e => upd({ min: Number(e.target.value) })} className="input-base" /></Field>
          <Field label="Max"><input type="number" value={el.max ?? 100} onChange={e => upd({ max: Number(e.target.value) })} className="input-base" /></Field>
        </div>
      )}
      {/* Number/Currency prefix + suffix */}
      {['number','currency'].includes(element.type) && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Prefix"><input value={(el as any).prefix ?? ''} onChange={e => upd({ prefix: e.target.value })} className="input-base" placeholder="e.g. $" /></Field>
          <Field label="Suffix"><input value={(el as any).suffix ?? ''} onChange={e => upd({ suffix: e.target.value })} className="input-base" placeholder="e.g. kg" /></Field>
        </div>
      )}
      {/* Rich text default content */}
      {element.type === 'richtext' && (
        <Field label="Default Content">
          <textarea
            rows={6}
            value={(el as any).defaultContent ?? ''}
            onChange={e => upd({ defaultContent: e.target.value })}
            className="input-base resize-y font-mono text-xs leading-relaxed"
            placeholder="Enter default HTML or plain text…"
          />
          <p className="text-xs text-gray-400 mt-1">Accepts plain text or HTML markup.</p>
        </Field>
      )}
      {/* Spacer height */}
      {element.type === 'spacer' && (
        <Field label="Height (px)">
          <input type="number" min={4} max={400} value={(el as any).height ?? 24} onChange={e => upd({ height: Number(e.target.value) })} className="input-base" />
        </Field>
      )}
      {/* Star rating */}
      {element.type === 'starrating' && (
        <Field label="Max Stars">
          <select value={(el as any).maxStars ?? 5} onChange={e => upd({ maxStars: Number(e.target.value) })} className="input-base">
            {[3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} stars</option>)}
          </select>
        </Field>
      )}
      {/* NPS / rating scale */}
      {element.type === 'rating' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Min"><input type="number" value={(el as any).min ?? 0} onChange={e => upd({ min: Number(e.target.value) })} className="input-base" /></Field>
            <Field label="Max"><input type="number" value={(el as any).max ?? 10} onChange={e => upd({ max: Number(e.target.value) })} className="input-base" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Low Label"><input value={(el as any).lowLabel ?? ''} onChange={e => upd({ lowLabel: e.target.value })} className="input-base" placeholder="Not likely" /></Field>
            <Field label="High Label"><input value={(el as any).highLabel ?? ''} onChange={e => upd({ highLabel: e.target.value })} className="input-base" placeholder="Very likely" /></Field>
          </div>
        </div>
      )}
      {/* Yes/No button labels */}
      {element.type === 'yesno' && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Yes Label"><input value={(el as any).yesLabel ?? 'Yes'} onChange={e => upd({ yesLabel: e.target.value })} className="input-base" /></Field>
          <Field label="No Label"><input value={(el as any).noLabel ?? 'No'} onChange={e => upd({ noLabel: e.target.value })} className="input-base" /></Field>
        </div>
      )}
      {/* File upload */}
      {element.type === 'fileupload' && (
        <div className="space-y-2">
          <Field label="Accepted Types">
            <input value={(el as any).accept ?? ''} onChange={e => upd({ accept: e.target.value })} className="input-base text-xs" placeholder=".pdf,.docx,image/*" />
          </Field>
          <Field label="Max Size (MB)">
            <input type="number" min={1} value={(el as any).maxSizeMb ?? 10} onChange={e => upd({ maxSizeMb: Number(e.target.value) })} className="input-base" />
          </Field>
          <Toggle label="Allow Multiple Files" checked={(el as any).multiple ?? false} onChange={v => upd({ multiple: v })} />
        </div>
      )}
      {/* Calculated expression */}
      {element.type === 'calculated' && (
        <Field label="Expression">
          <textarea
            rows={3}
            value={(el as any).expression ?? ''}
            onChange={e => upd({ expression: e.target.value })}
            className="input-base resize-none font-mono text-xs"
            placeholder="{field_a} + {field_b}"
          />
          <p className="text-xs text-gray-400 mt-1">Use {'{field_name}'} to reference other fields.</p>
        </Field>
      )}
      {/* AI controls */}
      {['aiextract','aisuggest','aisummary'].includes(element.type) && (
        <Field label="AI Prompt">
          <textarea rows={3} value={(el as any).prompt ?? ''} onChange={e => upd({ prompt: e.target.value })} className="input-base resize-none text-xs" placeholder="Describe what this AI field should do…" />
        </Field>
      )}
      {element.type === 'aisummary' && (
        <Field label="Source Fields (comma-separated)">
          <input
            value={(el as any).sourceFields?.join(', ') ?? ''}
            onChange={e => upd({ sourceFields: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
            className="input-base text-xs"
            placeholder="field_a, field_b"
          />
        </Field>
      )}
      {/* Lookup */}
      {element.type === 'lookup' && (
        <div className="space-y-2">
          <Field label="Search API URL">
            <input value={(el as any).searchUrl ?? ''} onChange={e => upd({ searchUrl: e.target.value })} className="input-base text-xs" placeholder="https://api.example.com/search?q={query}" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Display Field"><input value={(el as any).displayField ?? ''} onChange={e => upd({ displayField: e.target.value })} className="input-base text-xs" placeholder="name" /></Field>
            <Field label="Value Field"><input value={(el as any).valueField ?? ''} onChange={e => upd({ valueField: e.target.value })} className="input-base text-xs" placeholder="id" /></Field>
          </div>
        </div>
      )}
      {/* Signature */}
      {element.type === 'signature' && (
        <div className="space-y-2">
          <Field label="Signature Label">
            <input value={(el as any).sigLabel ?? 'Sign here'} onChange={e => upd({ sigLabel: e.target.value })} className="input-base" />
          </Field>
          <Toggle label="Show Date Below Signature" checked={(el as any).showDate ?? false} onChange={v => upd({ showDate: v })} />
        </div>
      )}
      {/* Hidden field */}
      {element.type === 'hidden' && (
        <Field label="Default Value">
          <input value={(el as any).defaultValue ?? ''} onChange={e => upd({ defaultValue: e.target.value })} className="input-base font-mono text-xs" placeholder="Static value or {variable}" />
        </Field>
      )}

      {/* ── Date / Time controls ─────────────────────────────────────────── */}
      {['date','time','datetime','daterange','monthpicker','yearpicker'].includes(element.type) && (
        <div className="space-y-3 pt-1">
          {/* Calendar system — not shown for time-only */}
          {element.type !== 'time' && <Field label="Calendar System">
            <div className="flex rounded overflow-hidden border border-gray-200">
              {[
                { value: 'gregorian',   label: 'Gregorian',    sub: 'Default' },
                { value: 'umm-al-qura', label: 'Umm Al Qura',  sub: 'هجري' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => upd({ calendarType: opt.value as any })}
                  className={cn(
                    'flex-1 py-1.5 text-xs transition-colors flex flex-col items-center gap-0.5',
                    (el as any).calendarType === opt.value || (!((el as any).calendarType) && opt.value === 'gregorian')
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-500 hover:bg-gray-50'
                  )}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className="opacity-70">{opt.sub}</span>
                </button>
              ))}
            </div>
          </Field>}
          {/* Also allow both (dual calendar) — only for date types, not time */}
          {element.type !== 'time' && <button
            type="button"
            onClick={() => upd({ calendarType: (el as any).calendarType === 'both' ? 'gregorian' : 'both' })}
            className={cn(
              'w-full text-xs py-1.5 rounded border transition-colors',
              (el as any).calendarType === 'both'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            )}
          >
            {(el as any).calendarType === 'both' ? '✓ ' : ''}Show Both Calendars Side-by-Side
          </button>}
          {/* Time format for datetime / time */}
          {['datetime','time'].includes(element.type) && (
            <Field label="Time Format">
              <select value={(el as any).timeFormat ?? '12h'} onChange={e => upd({ timeFormat: e.target.value as any })} className="input-base">
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </Field>
          )}
          {/* Hint */}
          <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
            {element.type === 'time'
              ? <>Users can <strong>type</strong> the time or click to open the time picker.</>
              : <>Users can <strong>type</strong> the date directly or click to open the calendar picker.</>
            }
            {(el as any).calendarType === 'umm-al-qura' && (
              <><br /><span className="text-amber-600">Umm Al Qura dates display in Arabic-Indic numerals.</span></>
            )}
            {(el as any).calendarType === 'both' && (
              <><br /><span className="text-indigo-600">Both Gregorian and Umm Al Qura shown side-by-side.</span></>
            )}
          </div>
        </div>
      )}

      {/* ── Progress Bar ─────────────────────────────────────────────────── */}
      {element.type === 'progressbar' && (
        <div className="space-y-3">
          <Field label="Value">
            <div className="flex items-center gap-2">
              <input type="number" min={(el as any).min ?? 0} max={(el as any).max ?? 100}
                value={(el as any).value ?? 0}
                onChange={e => upd({ value: Number(e.target.value) })}
                className="input-base flex-1" />
              <span className="text-xs text-gray-400 whitespace-nowrap">of {(el as any).max ?? 100}</span>
            </div>
          </Field>
          <Field label="Min / Max">
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={(el as any).min ?? 0} onChange={e => upd({ min: Number(e.target.value) })} className="input-base" placeholder="Min" />
              <input type="number" value={(el as any).max ?? 100} onChange={e => upd({ max: Number(e.target.value) })} className="input-base" placeholder="Max" />
            </div>
          </Field>
          <Field label="Bind to Field (runtime)">
            <input value={(el as any).valueField ?? ''} onChange={e => upd({ valueField: e.target.value })} className="input-base font-mono text-xs" placeholder="field_name" />
          </Field>
          <Field label="Bar Style">
            <select value={(el as any).barStyle ?? 'rounded'} onChange={e => upd({ barStyle: e.target.value })} className="input-base">
              {['flat','rounded','striped','gradient'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Bar Height (px)">
            <input type="number" min={4} max={40} value={(el as any).barHeight ?? 12} onChange={e => upd({ barHeight: Number(e.target.value) })} className="input-base" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Bar Color"><input type="color" value={(el as any).barColor ?? '#6366f1'} onChange={e => upd({ barColor: e.target.value })} className="w-full h-9 rounded border border-gray-200 cursor-pointer" /></Field>
            <Field label="Track Color"><input type="color" value={(el as any).trackColor ?? '#e5e7eb'} onChange={e => upd({ trackColor: e.target.value })} className="w-full h-9 rounded border border-gray-200 cursor-pointer" /></Field>
          </div>
          <Field label="Label Format">
            <select value={(el as any).labelFormat ?? 'percent'} onChange={e => upd({ labelFormat: e.target.value })} className="input-base">
              <option value="percent">Percent (%)</option>
              <option value="value">Value</option>
              <option value="fraction">Fraction (x/max)</option>
              <option value="custom">Custom</option>
            </select>
          </Field>
          {(el as any).labelFormat === 'custom' && (
            <Field label="Custom Label">
              <input value={(el as any).customLabel ?? ''} onChange={e => upd({ customLabel: e.target.value })} className="input-base text-xs" placeholder="{value} of {max} complete" />
            </Field>
          )}
          <Toggle label="Show Label" propKey="showLabel" checked={(el as any).showLabel !== false} onChange={v => upd({ showLabel: v })} />
          <Toggle label="Animate on Load" propKey="animateOnLoad" checked={(el as any).animateOnLoad !== false} onChange={v => upd({ animateOnLoad: v })} />
        </div>
      )}

      {/* ── Step Indicator ───────────────────────────────────────────────── */}
      {element.type === 'stepindicator' && (
        <div className="space-y-3">
          <Field label="Preview Step">
            <div className="flex items-center gap-2">
              <input type="number" min={0} max={((el as any).steps?.length ?? 3) - 1}
                value={(el as any).previewStep ?? 0}
                onChange={e => upd({ previewStep: Number(e.target.value) })}
                className="input-base flex-1" />
              <span className="text-xs text-gray-400">of {((el as any).steps?.length ?? 3) - 1}</span>
            </div>
          </Field>
          <Field label="Current Step Field (runtime)">
            <input value={(el as any).currentStepField ?? ''} onChange={e => upd({ currentStepField: e.target.value })} className="input-base font-mono text-xs" placeholder="field_name" />
          </Field>
          <Field label="Step Style">
            <select value={(el as any).stepStyle ?? 'numbers'} onChange={e => upd({ stepStyle: e.target.value })} className="input-base">
              {['numbers','dots','pills','icons'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Orientation">
            <select value={(el as any).orientation ?? 'horizontal'} onChange={e => upd({ orientation: e.target.value })} className="input-base">
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </Field>
          <Toggle label="Show Labels" propKey="showLabels" checked={(el as any).showLabels !== false} onChange={v => upd({ showLabels: v })} />
          <div className="border-t border-gray-100 pt-2">
            <p className="text-xs font-medium text-gray-500 mb-2">Steps</p>
            {((el as any).steps ?? []).map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400 w-4">{i+1}</span>
                <input value={s.label} onChange={e => { const steps = [...(el as any).steps]; steps[i] = { ...steps[i], label: e.target.value }; upd({ steps }); }} className="input-base flex-1 text-xs" placeholder="Step label" />
                <button onClick={() => { const steps = ((el as any).steps ?? []).filter((_: any, j: number) => j !== i); upd({ steps }); }} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={12} /></button>
              </div>
            ))}
            <button onClick={() => { const steps = [...((el as any).steps ?? []), { id: genId('step'), label: `Step ${((el as any).steps?.length ?? 0) + 1}`, description: '' }]; upd({ steps }); }} className="text-xs text-indigo-600 hover:underline flex items-center gap-1"><Plus size={12} />Add Step</button>
          </div>
        </div>
      )}

      {/* ── Checklist ────────────────────────────────────────────────────── */}
      {element.type === 'checklist' && (
        <div className="space-y-3">
          <Field label="Title">
            <input value={(el as any).checklistTitle ?? 'Checklist'} onChange={e => upd({ checklistTitle: e.target.value })} className="input-base" />
          </Field>
          <Field label="Check Style">
            <select value={(el as any).checkStyle ?? 'check'} onChange={e => upd({ checkStyle: e.target.value })} className="input-base">
              <option value="check">Checkmark</option>
              <option value="circle">Circle</option>
              <option value="number">Number</option>
            </select>
          </Field>
          <Toggle label="Show Count" propKey="showCount" checked={(el as any).showCount !== false} onChange={v => upd({ showCount: v })} />
          <Toggle label="Show Percentage" propKey="showPercentage" checked={(el as any).showPercentage ?? false} onChange={v => upd({ showPercentage: v })} />
          <div className="border-t border-gray-100 pt-2">
            <p className="text-xs font-medium text-gray-500 mb-2">Items</p>
            {((el as any).items ?? []).map((item: any, i: number) => (
              <div key={i} className="mb-3 p-2 bg-gray-50 rounded-lg space-y-1.5">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={item.defaultChecked ?? false}
                    onChange={e => { const items = [...(el as any).items]; items[i] = { ...items[i], defaultChecked: e.target.checked }; upd({ items }); }}
                    className="accent-indigo-600" />
                  <input value={item.label} onChange={e => { const items = [...(el as any).items]; items[i] = { ...items[i], label: e.target.value }; upd({ items }); }} className="input-base flex-1 text-xs" placeholder="Item label" />
                  <button onClick={() => { const items = ((el as any).items ?? []).filter((_: any, j: number) => j !== i); upd({ items }); }} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={12} /></button>
                </div>
                <input value={item.fieldBinding ?? ''} onChange={e => { const items = [...(el as any).items]; items[i] = { ...items[i], fieldBinding: e.target.value }; upd({ items }); }} className="input-base text-xs font-mono" placeholder="Bind to field (runtime)" />
              </div>
            ))}
            <button onClick={() => { const items = [...((el as any).items ?? []), { id: genId('item'), label: `Item ${((el as any).items?.length ?? 0) + 1}`, defaultChecked: false, fieldBinding: '', required: false }]; upd({ items }); }} className="text-xs text-indigo-600 hover:underline flex items-center gap-1"><Plus size={12} />Add Item</button>
          </div>
        </div>
      )}

      {/* ── Score Card ───────────────────────────────────────────────────── */}
      {element.type === 'scorecard' && (
        <div className="space-y-3">
          <Field label="Title">
            <input value={(el as any).scorecardTitle ?? 'Score Card'} onChange={e => upd({ scorecardTitle: e.target.value })} className="input-base" />
          </Field>
          <Toggle label="Show Total" propKey="showTotal" checked={(el as any).showTotal !== false} onChange={v => upd({ showTotal: v })} />
          <Toggle label="Show Per Section" checked={(el as any).showPerSection !== false} onChange={v => upd({ showPerSection: v })} />
          <div className="border-t border-gray-100 pt-2">
            <p className="text-xs font-medium text-gray-500 mb-2">Sections</p>
            {((el as any).sections ?? []).map((sec: any, i: number) => (
              <div key={i} className="mb-3 p-2 bg-gray-50 rounded-lg space-y-1.5">
                <div className="flex items-center gap-2">
                  <input value={sec.label} onChange={e => { const sections = [...(el as any).sections]; sections[i] = { ...sections[i], label: e.target.value }; upd({ sections }); }} className="input-base flex-1 text-xs" placeholder="Section label" />
                  <button onClick={() => { const sections = ((el as any).sections ?? []).filter((_: any, j: number) => j !== i); upd({ sections }); }} className="text-red-400 p-1"><Trash2 size={12} /></button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div><label className="text-xs text-gray-400">Preview Score</label><input type="number" min={0} max={100} value={sec.previewScore ?? 0} onChange={e => { const sections = [...(el as any).sections]; sections[i] = { ...sections[i], previewScore: Number(e.target.value) }; upd({ sections }); }} className="input-base text-xs" /></div>
                  <div><label className="text-xs text-gray-400">Weight</label><input type="number" min={0} step={0.1} value={sec.weight ?? 1} onChange={e => { const sections = [...(el as any).sections]; sections[i] = { ...sections[i], weight: Number(e.target.value) }; upd({ sections }); }} className="input-base text-xs" /></div>
                </div>
              </div>
            ))}
            <button onClick={() => { const sections = [...((el as any).sections ?? []), { id: genId('sec'), label: `Section ${((el as any).sections?.length ?? 0) + 1}`, fields: [], weight: 1, previewScore: 0 }]; upd({ sections }); }} className="text-xs text-indigo-600 hover:underline flex items-center gap-1"><Plus size={12} />Add Section</button>
          </div>
        </div>
      )}

      {/* ── Summary Pill ─────────────────────────────────────────────────── */}
      {element.type === 'summarypill' && (
        <div className="space-y-3">
          <Field label="Preview Done Count">
            <div className="flex items-center gap-2">
              <input type="number" min={0} value={(el as any).previewDone ?? 0}
                onChange={e => upd({ previewDone: Number(e.target.value) })}
                className="input-base flex-1" />
              <span className="text-xs text-gray-400">of {((el as any).trackedFields?.length ?? 0) || '?'}</span>
            </div>
          </Field>
          <Field label="Label">
            <input value={(el as any).pillLabel ?? 'Form Progress'} onChange={e => upd({ pillLabel: e.target.value })} className="input-base" />
          </Field>
          <Field label="Tracked Fields (comma-separated)">
            <textarea rows={2} value={((el as any).trackedFields ?? []).join(', ')}
              onChange={e => upd({ trackedFields: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
              className="input-base resize-none text-xs font-mono" placeholder="field_a, field_b, field_c" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Pill Color"><input type="color" value={(el as any).pillColor ?? '#6366f1'} onChange={e => upd({ pillColor: e.target.value })} className="w-full h-9 rounded border border-gray-200 cursor-pointer" /></Field>
            <Field label="Text Color"><input type="color" value={(el as any).pillTextColor ?? '#ffffff'} onChange={e => upd({ pillTextColor: e.target.value })} className="w-full h-9 rounded border border-gray-200 cursor-pointer" /></Field>
          </div>
          <Toggle label="Required Fields Only" propKey="requiredOnly" checked={(el as any).requiredOnly ?? true} onChange={v => upd({ requiredOnly: v })} />
          <Toggle label="Show Missing Fields" propKey="showMissingFields" checked={(el as any).showMissingFields ?? true} onChange={v => upd({ showMissingFields: v })} />
        </div>
      )}

      {/* Required / Read-only toggles */}
      {'required' in element && (
        <div className="space-y-2 pt-1 border-t border-gray-100">
          <Toggle label="Required" propKey="required" checked={(el as FieldElement).required ?? false} onChange={v => upd({ required: v })} />
          <Toggle label="Read-only" propKey="readOnly" checked={(el as FieldElement).readOnly ?? false} onChange={v => upd({ readOnly: v })} />
        </div>
      )}
    </div>
    </PropProvider>
  );
}

// ── Validation Tab ────────────────────────────────────────────────────────────
function ValidationTab({ element, upd }: { element: FieldElement; upd: (p: any) => void }) {
  const v = element.validation ?? {};
  const updV = (patch: any) => upd({ validation: { ...v, ...patch } });
  return (
    <PropProvider element={element} upd={upd}>
    <div className="space-y-3">
      {['text','email','phone','url','password','longtext'].includes(element.type) && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Min Length" propKey="validation.minLength"><input type="number" min={0} value={v.minLength ?? ''} onChange={e => updV({ minLength: e.target.value ? Number(e.target.value) : null })} className="input-base" /></Field>
          <Field label="Max Length" propKey="validation.maxLength"><input type="number" min={0} value={v.maxLength ?? ''} onChange={e => updV({ maxLength: e.target.value ? Number(e.target.value) : null })} className="input-base" /></Field>
        </div>
      )}
      {['number','currency','slider','rating'].includes(element.type) && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Min" propKey="validation.min"><input type="number" value={v.min ?? ''} onChange={e => updV({ min: e.target.value ? Number(e.target.value) : null })} className="input-base" /></Field>
          <Field label="Max" propKey="validation.max"><input type="number" value={v.max ?? ''} onChange={e => updV({ max: e.target.value ? Number(e.target.value) : null })} className="input-base" /></Field>
        </div>
      )}
      {['text','email','phone','url'].includes(element.type) && (
        <Field label="Pattern (regex)">
          <input value={v.pattern ?? ''} onChange={e => updV({ pattern: e.target.value || null })} className="input-base font-mono text-xs" placeholder="e.g. ^[A-Z]+" />
          <input value={v.patternMessage ?? ''} onChange={e => updV({ patternMessage: e.target.value || null })} className="input-base mt-1 text-xs" placeholder="Error message" />
        </Field>
      )}
      {['multiselect','checkbox'].includes(element.type) && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Min Selections"><input type="number" min={0} value={v.minSelections ?? ''} onChange={e => updV({ minSelections: e.target.value ? Number(e.target.value) : null })} className="input-base" /></Field>
          <Field label="Max Selections"><input type="number" min={0} value={v.maxSelections ?? ''} onChange={e => updV({ maxSelections: e.target.value ? Number(e.target.value) : null })} className="input-base" /></Field>
        </div>
      )}
    </div>
    </PropProvider>
  );
}

// ── Style Tab ─────────────────────────────────────────────────────────────────
function StyleTab({ element, upd }: { element: FormElement; upd: (p: any) => void }) {
  const s = element.style ?? {};
  const updS = (patch: any) => upd({ style: { ...s, ...patch } });
  return (
    <PropProvider element={element} upd={upd}>
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Label Color" propKey="style.labelColor"><input type="color" value={s.labelColor ?? '#374151'} onChange={e => updS({ labelColor: e.target.value })} className="w-full h-9 rounded border border-gray-200 cursor-pointer" /></Field>
        <Field label="Field Background" propKey="style.fieldBackground"><input type="color" value={s.fieldBackground ?? '#ffffff'} onChange={e => updS({ fieldBackground: e.target.value })} className="w-full h-9 rounded border border-gray-200 cursor-pointer" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Field Text" propKey="style.fieldTextColor"><input type="color" value={s.fieldTextColor ?? '#374151'} onChange={e => updS({ fieldTextColor: e.target.value })} className="w-full h-9 rounded border border-gray-200 cursor-pointer" /></Field>
        <Field label="Border Color" propKey="style.borderColor"><input type="color" value={s.borderColor ?? '#e5e7eb'} onChange={e => updS({ borderColor: e.target.value })} className="w-full h-9 rounded border border-gray-200 cursor-pointer" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Accent Color" propKey="style.accentColor"><input type="color" value={s.accentColor ?? '#6366f1'} onChange={e => updS({ accentColor: e.target.value })} className="w-full h-9 rounded border border-gray-200 cursor-pointer" /></Field>
        <Field label="Error Color"><input type="color" value={s.errorColor ?? '#ef4444'} onChange={e => updS({ errorColor: e.target.value })} className="w-full h-9 rounded border border-gray-200 cursor-pointer" /></Field>
      </div>
      <Field label={`Border Radius — ${s.borderRadius ?? 6}px`}>
        <input type="range" min={0} max={24} value={s.borderRadius ?? 6} onChange={e => updS({ borderRadius: Number(e.target.value) })} className="w-full accent-indigo-600" />
      </Field>
      <Field label="Border Width (px)">
        <input type="number" min={0} max={8} value={s.borderWidth ?? 1} onChange={e => updS({ borderWidth: Number(e.target.value) })} className="input-base" />
      </Field>
      <Field label="Label Font Size (px)">
        <input type="number" min={10} max={24} value={s.labelFontSize ?? ''} onChange={e => updS({ labelFontSize: e.target.value ? Number(e.target.value) : null })} className="input-base" placeholder="Inherit from theme" />
      </Field>
      <Field label="Label Font Weight">
        <select value={s.labelFontWeight ?? 'medium'} onChange={e => updS({ labelFontWeight: e.target.value })} className="input-base">
          <option value="normal">Normal</option>
          <option value="medium">Medium</option>
          <option value="semibold">Semibold</option>
          <option value="bold">Bold</option>
        </select>
      </Field>
      <Field label="Font Size">
        <select value={s.fontSize ?? ''} onChange={e => updS({ fontSize: e.target.value || null })} className="input-base">
          <option value="">Theme default</option>
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </select>
      </Field>
      <Field label="Padding">
        <input value={s.padding ?? ''} onChange={e => updS({ padding: e.target.value || null })} className="input-base text-xs" placeholder="8px 12px" />
      </Field>
    </div>
    </PropProvider>
  );
}

// ── Logic Tab ────────────────────────────────────────────────────────────────
function LogicTab({ element }: { element: FormElement }) {
  const { schema } = useDesignerStore();
  const rules = element.logic ?? [];
  return (
    <div className="space-y-3">
      {rules.length === 0 ? (
        <div className="text-xs text-gray-400 text-center py-6">No logic rules yet.<br />Add rules to show/hide or validate this field.</div>
      ) : (
        rules.map(r => (
          <div key={r.id} className="border border-gray-200 rounded-lg p-3 text-xs">
            <div className="font-medium text-gray-600">{r.name}</div>
            <div className="text-gray-400 mt-1">{r.conditions.rules.length} condition(s) · {r.actions.length} action(s)</div>
          </div>
        ))
      )}
      <p className="text-xs text-gray-400 text-center">Use the Logic Builder tab to create rules.</p>
    </div>
  );
}

// ── Data Tab ─────────────────────────────────────────────────────────────────
function DataTab({ element, upd }: { element: FieldElement; upd: (p: any) => void }) {
  const db = element.dataBinding;
  const source = db?.source ?? 'static';
  const updDb = (patch: any) => upd({ dataBinding: { ...db, ...patch } });
  return (
    <div className="space-y-3">
      <Field label="Data Source">
        <select value={source} onChange={e => updDb({ source: e.target.value })} className="input-base">
          <option value="static">Static Options</option>
          <option value="api">API / URL</option>
          <option value="aifabric">AI Fabric Dataset</option>
          <option value="variable">Form Variable</option>
        </select>
      </Field>
      {source === 'api' && (
        <div className="space-y-2">
          <Field label="API URL">
            <input value={db?.apiConfig?.url ?? ''} onChange={e => updDb({ apiConfig: { ...db?.apiConfig, url: e.target.value, method: 'GET', valueField: db?.apiConfig?.valueField ?? 'value', labelField: db?.apiConfig?.labelField ?? 'label' } })} className="input-base text-xs" placeholder="https://api.example.com/options" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Value Field"><input value={db?.apiConfig?.valueField ?? 'value'} onChange={e => updDb({ apiConfig: { ...db?.apiConfig, valueField: e.target.value } })} className="input-base text-xs" /></Field>
            <Field label="Label Field"><input value={db?.apiConfig?.labelField ?? 'label'} onChange={e => updDb({ apiConfig: { ...db?.apiConfig, labelField: e.target.value } })} className="input-base text-xs" /></Field>
          </div>
        </div>
      )}
      {source === 'variable' && (
        <Field label="Variable Name">
          <input value={db?.variableName ?? ''} onChange={e => updDb({ variableName: e.target.value })} className="input-base font-mono text-xs" placeholder="variableName" />
        </Field>
      )}
    </div>
  );
}

// ── Options editor ────────────────────────────────────────────────────────────
function OptionsEditor({ el, upd }: { el: FieldElement; upd: (p: any) => void }) {
  const options = el.options ?? [];
  const update = (i: number, patch: Partial<{ value: string; label: string }>) => {
    const next = options.map((o, j) => j === i ? { ...o, ...patch } : o);
    upd({ options: next });
  };
  const add    = () => upd({ options: [...options, { value: `option${options.length + 1}`, label: `Option ${options.length + 1}` }] });
  const remove = (i: number) => upd({ options: options.filter((_, j) => j !== i) });
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">Options</p>
      {options.map((o, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <GripVertical size={12} className="text-gray-300 shrink-0" />
          <input value={o.label} onChange={e => update(i, { label: e.target.value })} placeholder="Label" className="input-base flex-1 text-xs" />
          <input value={o.value} onChange={e => update(i, { value: e.target.value })} placeholder="Value" className="input-base w-24 text-xs font-mono" />
          <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 p-0.5 shrink-0"><Trash2 size={12} /></button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 mt-1">
        <Plus size={12} /> Add option
      </button>
    </div>
  );
}

// ── Width selector ────────────────────────────────────────────────────────────
function WidthSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const presets = ['25%','33%','50%','66%','75%','100%'];
  return (
    <div className="flex rounded overflow-hidden border border-gray-200">
      {presets.map(p => (
        <button key={p} onClick={() => onChange(p)}
          className={cn('flex-1 py-1 text-xs transition-colors', value === p ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50')}>
          {p}
        </button>
      ))}
    </div>
  );
}

// ── Expression-binding context ───────────────────────────────────────────────
interface PropCtx { element: FormElement; upd: (p: any) => void; }
const PropContext = createContext<PropCtx | null>(null);
function PropProvider({ element, upd, children }: PropCtx & { children: React.ReactNode }) {
  return <PropContext.Provider value={{ element, upd }}>{children}</PropContext.Provider>;
}
function usePropCtx() { return useContext(PropContext); }

// ── Shared helpers ────────────────────────────────────────────────────────────
function Field({ label, propKey, children }: { label: string; propKey?: string; children: React.ReactNode }) {
  const ctx = usePropCtx();
  const bindings: Record<string,string> = (ctx?.element as any)?.bindings ?? {};
  const isBound = propKey ? !!bindings[propKey] : false;
  const [exprMode, setExprMode] = useState(isBound);

  const toggleExpr = () => {
    if (!propKey || !ctx) return;
    const next = !exprMode;
    setExprMode(next);
    if (!next) {
      // Clear binding when switching back to static
      const { [propKey]: _removed, ...rest } = bindings;
      ctx.upd({ bindings: rest });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-gray-500">{label}</label>
        {propKey && (
          <button
            onClick={toggleExpr}
            title={isBound ? `Expression: ${bindings[propKey]}` : 'Bind to expression'}
            className={cn(
              'flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md transition-all leading-none border',
              (exprMode || isBound)
                ? 'bg-violet-600 text-white border-violet-700 shadow-sm'
                : 'text-gray-400 border-gray-200 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50'
            )}
          >
            <span className="font-mono">{'{}'}</span>
            <span>fx</span>
          </button>
        )}
      </div>
      {(exprMode || isBound) && propKey && ctx ? (
        <input
          value={bindings[propKey] ?? ''}
          onChange={e => ctx.upd({ bindings: { ...bindings, [propKey]: e.target.value } })}
          className="input-base font-mono text-xs text-violet-700 bg-violet-50 border-violet-200 placeholder:text-violet-300"
          placeholder="= expression or {{field}}"
          autoFocus
        />
      ) : children}
    </div>
  );
}

function Toggle({ label, propKey, checked, onChange }: { label: string; propKey?: string; checked: boolean; onChange: (v: boolean) => void }) {
  const ctx = usePropCtx();
  const bindings: Record<string,string> = (ctx?.element as any)?.bindings ?? {};
  const isBound = propKey ? !!bindings[propKey] : false;
  const [exprMode, setExprMode] = useState(isBound);

  const toggleExpr = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!propKey || !ctx) return;
    const next = !exprMode;
    setExprMode(next);
    if (!next) {
      const { [propKey]: _removed, ...rest } = bindings;
      ctx.upd({ bindings: rest });
    }
  };

  if ((exprMode || isBound) && propKey && ctx) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">{label}</span>
          <button onClick={toggleExpr} className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-violet-600 text-white border border-violet-700 shadow-sm leading-none"><span className="font-mono">{'{}'}</span><span>fx</span></button>
        </div>
        <input
          value={bindings[propKey] ?? ''}
          onChange={e => ctx.upd({ bindings: { ...bindings, [propKey]: e.target.value } })}
          className="input-base font-mono text-xs text-violet-700 bg-violet-50 border-violet-200 placeholder:text-violet-300"
          placeholder="= expression or {{field}}"
          autoFocus
        />
      </div>
    );
  }

  return (
    <label className="flex items-center justify-between text-xs text-gray-600 cursor-pointer select-none group">
      {label}
      <div className="flex items-center gap-1.5">
        {propKey && (
          <button onClick={toggleExpr} className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border text-gray-400 border-gray-200 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 leading-none opacity-0 group-hover:opacity-100 transition-all">
            <span className="font-mono">{'{}'}</span><span>fx</span>
          </button>
        )}
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="rounded accent-indigo-600" />
      </div>
    </label>
  );
}
