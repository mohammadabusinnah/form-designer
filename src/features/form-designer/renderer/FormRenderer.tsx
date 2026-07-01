import { useState, useEffect } from 'react';
import type { FormDefinition, FormElement, FieldElement, SectionElement, ColumnsElement, TabsElement, AccordionElement, FrameElement, LogicRule, FormPage } from '../types/schema';
import { cn } from '../utils/cn';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle, AlertTriangle, Info, ChevronLeft } from 'lucide-react';

interface Props {
  schema: FormDefinition;
  initialValues?: Record<string, unknown>;
  onSubmit?: (data: Record<string, unknown>) => void;
  onDraftSave?: (data: Record<string, unknown>) => void;
  readOnly?: boolean;
}

export function FormRenderer({ schema, initialValues = {}, onSubmit, onDraftSave, readOnly = false }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const page = schema.pages[pageIndex];
  const isLast = pageIndex === schema.pages.length - 1;

  const setValue = (name: string, value: unknown) => {
    setValues(v => ({ ...v, [name]: value }));
    if (errors[name]) setErrors(e => { const ne = { ...e }; delete ne[name]; return ne; });
  };

  const validate = (p: FormPage): boolean => {
    const newErrors: Record<string, string> = {};
    function walk(elements: FormElement[]) {
      for (const el of elements) {
        const f = el as FieldElement;
        if (f.required && (values[f.name] === undefined || values[f.name] === '' || values[f.name] === null)) {
          newErrors[f.name] = `${f.label || f.name} is required`;
        }
        if (f.validation?.minLength && typeof values[f.name] === 'string' && (values[f.name] as string).length < f.validation.minLength) {
          newErrors[f.name] = `Minimum ${f.validation.minLength} characters required`;
        }
        if (f.validation?.maxLength && typeof values[f.name] === 'string' && (values[f.name] as string).length > f.validation.maxLength) {
          newErrors[f.name] = `Maximum ${f.validation.maxLength} characters allowed`;
        }
        if (f.validation?.pattern && values[f.name]) {
          try {
            if (!new RegExp(f.validation.pattern).test(String(values[f.name]))) {
              newErrors[f.name] = f.validation.patternMessage ?? 'Invalid format';
            }
          } catch {}
        }
        // Recurse
        if ('children' in el) walk((el as any).children ?? []);
        if ('columnDefs' in el) (el as ColumnsElement).columnDefs.forEach(c => walk(c.children));
        if ('tabList' in el) (el as TabsElement).tabList.forEach(t => walk(t.children));
        if ('panels' in el) (el as AccordionElement).panels.forEach(p => walk(p.children));
      }
    }
    walk(p.elements);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate(page)) setPageIndex(i => Math.min(i + 1, schema.pages.length - 1));
  };

  const handleSubmit = () => {
    if (!validate(page)) return;
    setSubmitted(true);
    onSubmit?.({ formId: schema.id, formVersion: schema.version, submittedAt: new Date().toISOString(), data: values });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Form Submitted</h2>
          <p className="text-gray-500">Thank you! Your response has been recorded.</p>
        </div>
      </div>
    );
  }

  const totalPages = schema.pages.length;
  const progress = ((pageIndex + 1) / totalPages) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir={schema.direction}>
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        {schema.settings.showProgressBar && totalPages > 1 && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{schema.settings.showPageNumbers ? `Page ${pageIndex + 1} of ${totalPages}` : ''}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full">
              <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">{schema.title}</h1>
            {schema.description && <p className="text-gray-500 mt-1">{schema.description}</p>}
            {totalPages > 1 && <p className="text-sm font-medium text-gray-600 mt-2">{page.title}</p>}
          </div>

          <div className="px-8 py-6 space-y-5">
            {page.elements.map(el => (
              <RenderElement key={el.id} element={el} values={values} errors={errors} onChange={setValue} readOnly={readOnly} schema={schema} />
            ))}
          </div>

          <div className="px-8 py-5 border-t border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              {pageIndex > 0 && (
                <button onClick={() => setPageIndex(i => i - 1)} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                  <ChevronLeft size={16} /> {schema.settings.backLabel}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              {schema.settings.allowSaveDraft && (
                <button onClick={() => onDraftSave?.(values)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                  Save Draft
                </button>
              )}
              {isLast ? (
                <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  {schema.settings.submitLabel}
                </button>
              ) : (
                <button onClick={handleNext} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  {schema.settings.nextLabel} →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RenderElement({ element, values, errors, onChange, readOnly, schema }: {
  element: FormElement; values: Record<string, unknown>; errors: Record<string, string>;
  onChange: (name: string, value: unknown) => void; readOnly: boolean; schema: FormDefinition;
}) {
  switch (element.type) {
    case 'section': return <RenderSection el={element as SectionElement} values={values} errors={errors} onChange={onChange} readOnly={readOnly} schema={schema} />;
    case 'columns': return <RenderColumns el={element as ColumnsElement} values={values} errors={errors} onChange={onChange} readOnly={readOnly} schema={schema} />;
    case 'tabs': return <RenderTabs el={element as TabsElement} values={values} errors={errors} onChange={onChange} readOnly={readOnly} schema={schema} />;
    case 'accordion': return <RenderAccordion el={element as AccordionElement} values={values} errors={errors} onChange={onChange} readOnly={readOnly} schema={schema} />;
    case 'frame': return <RenderFrame el={element as FrameElement} values={values} errors={errors} onChange={onChange} readOnly={readOnly} schema={schema} />;
    default: return <RenderField el={element as FieldElement} values={values} errors={errors} onChange={onChange} readOnly={readOnly} />;
  }
}

function RenderField({ el, values, errors, onChange, readOnly }: {
  el: FieldElement; values: Record<string, unknown>; errors: Record<string, string>;
  onChange: (name: string, v: unknown) => void; readOnly: boolean;
}) {
  const val = values[el.name] ?? el.defaultValue ?? '';
  const error = errors[el.name];
  const isReadOnly = readOnly || el.readOnly;

  if (!el.visible && el.visible !== undefined) return null;

  if (el.type === 'heading') return <div className={`font-bold text-gray-800 ${el.level === 1 ? 'text-3xl' : el.level === 2 ? 'text-2xl' : el.level === 3 ? 'text-xl' : 'text-lg'}`}>{el.text}</div>;
  if (el.type === 'paragraph') return <p className="text-gray-600">{el.content}</p>;
  if (el.type === 'divider') return <hr className="border-gray-200" />;
  if (el.type === 'spacer') return <div style={{ height: el.height ?? 24 }} />;
  if (el.type === 'hidden') return null;

  const fieldClass = cn(
    'w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 transition-colors outline-none',
    error ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 bg-white focus:border-indigo-500',
    isReadOnly && 'bg-gray-50 text-gray-500 cursor-not-allowed'
  );

  const renderInput = () => {
    switch (el.type) {
      case 'text': case 'email': case 'phone': case 'url':
        return <input type={el.type === 'email' ? 'email' : el.type === 'phone' ? 'tel' : el.type === 'url' ? 'url' : 'text'} value={String(val)} onChange={e => onChange(el.name, e.target.value)} placeholder={el.placeholder} readOnly={isReadOnly} className={fieldClass} />;
      case 'password':
        return <input type="password" value={String(val)} onChange={e => onChange(el.name, e.target.value)} placeholder={el.placeholder} readOnly={isReadOnly} className={fieldClass} />;
      case 'number': case 'currency':
        return (
          <div className="relative">
            {el.prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{el.prefix}</span>}
            <input type="number" value={String(val)} onChange={e => onChange(el.name, e.target.value)} min={el.min} max={el.max} step={el.step} readOnly={isReadOnly} className={cn(fieldClass, el.prefix && 'pl-7', el.suffix && 'pr-10')} />
            {el.suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{el.suffix}</span>}
          </div>
        );
      case 'longtext':
        return <textarea value={String(val)} onChange={e => onChange(el.name, e.target.value)} rows={el.rows ?? 4} placeholder={el.placeholder} readOnly={isReadOnly} className={cn(fieldClass, 'resize-none')} />;
      case 'dropdown':
        return (
          <select value={String(val)} onChange={e => onChange(el.name, e.target.value)} disabled={isReadOnly} className={fieldClass}>
            <option value="">{el.placeholder || 'Select…'}</option>
            {(el.options ?? []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      case 'radio':
        return (
          <div className={cn('space-y-2', el.layout === 'horizontal' && 'flex gap-4 space-y-0')}>
            {(el.options ?? []).map(o => (
              <label key={o.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="radio" name={el.name} value={o.value} checked={val === o.value} onChange={() => onChange(el.name, o.value)} disabled={isReadOnly} className="accent-indigo-600" />
                {o.label}
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className={cn('space-y-2', el.layout === 'horizontal' && 'flex flex-wrap gap-4 space-y-0')}>
            {(el.options ?? []).map(o => {
              const checked = Array.isArray(val) && (val as string[]).includes(o.value);
              const toggle = () => {
                const arr: string[] = Array.isArray(val) ? [...val as string[]] : [];
                onChange(el.name, checked ? arr.filter(v => v !== o.value) : [...arr, o.value]);
              };
              return (
                <label key={o.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" checked={checked} onChange={toggle} disabled={isReadOnly} className="accent-indigo-600 rounded" />
                  {o.label}
                </label>
              );
            })}
          </div>
        );
      case 'toggle':
        return (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => !isReadOnly && onChange(el.name, val === el.onValue ? el.offValue : el.onValue)}
              className={cn('relative w-11 h-6 rounded-full transition-colors focus:outline-none', val === el.onValue ? 'bg-indigo-600' : 'bg-gray-200')}
            >
              <div className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', val === el.onValue && 'translate-x-5')} />
            </button>
            <span className="text-sm text-gray-600">{val === el.onValue ? el.onLabel : el.offLabel}</span>
          </div>
        );
      case 'yesno':
        return (
          <div className="flex gap-2">
            {['Yes','No'].map(opt => (
              <button key={opt} type="button" onClick={() => !isReadOnly && onChange(el.name, opt.toLowerCase())}
                className={cn('px-5 py-2 border rounded-lg text-sm font-medium transition-colors', val === opt.toLowerCase() ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300')}
              >{opt}</button>
            ))}
          </div>
        );
      case 'starrating': {
        const stars = el.maxStars ?? 5;
        const rating = Number(val) || 0;
        return (
          <div className="flex gap-1">
            {Array.from({ length: stars }, (_, i) => (
              <button key={i} type="button" onClick={() => !isReadOnly && onChange(el.name, i + 1)} className="text-2xl transition-colors">
                <span className={i < rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
              </button>
            ))}
          </div>
        );
      }
      case 'slider': {
        const sliderVal = Number(val) || el.min || 0;
        return (
          <div>
            <input type="range" min={el.min ?? 0} max={el.max ?? 100} step={el.step ?? 1} value={sliderVal} onChange={e => onChange(el.name, Number(e.target.value))} disabled={isReadOnly} className="w-full accent-indigo-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>{el.min ?? 0}</span><span className="font-medium text-indigo-600">{sliderVal}</span><span>{el.max ?? 100}</span>
            </div>
          </div>
        );
      }
      case 'date': case 'time': case 'datetime': case 'daterange':
        return <input type={el.type === 'datetime' ? 'datetime-local' : el.type === 'daterange' ? 'date' : el.type} value={String(val)} onChange={e => onChange(el.name, e.target.value)} readOnly={isReadOnly} className={fieldClass} />;
      case 'fileupload':
        return (
          <label className={cn('flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors', error ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50')}>
            <div className="text-3xl mb-2">📎</div>
            <span className="text-sm text-gray-500">Drop files here or click to browse</span>
            {el.accept && <span className="text-xs text-gray-400 mt-1">{el.accept}</span>}
            <input type="file" multiple={el.maxFiles !== 1} accept={el.accept} className="sr-only" onChange={e => onChange(el.name, e.target.files)} disabled={isReadOnly} />
          </label>
        );
      case 'signature':
        return (
          <div className="border border-gray-200 rounded-xl h-32 bg-gray-50 flex items-center justify-center text-gray-400 cursor-pointer hover:border-indigo-300">
            ✍ Click to sign
          </div>
        );
      case 'rating':
        return (
          <div className="flex gap-1">
            {Array.from({ length: (el.max ?? 10) - (el.min ?? 0) + 1 }, (_, i) => {
              const v = (el.min ?? 0) + i;
              return (
                <button key={v} type="button" onClick={() => !isReadOnly && onChange(el.name, v)}
                  className={cn('w-9 h-9 border rounded-lg text-sm font-medium transition-colors', val === v ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300')}
                >{v}</button>
              );
            })}
          </div>
        );
      case 'aiextract': case 'aisuggest': case 'aisummary': case 'confidence':
        return (
          <div className="border border-purple-200 rounded-xl p-4 bg-purple-50 text-sm text-purple-700">
            ✨ AI field — {el.label}
          </div>
        );
      default:
        return <input value={String(val)} onChange={e => onChange(el.name, e.target.value)} className={fieldClass} />;
    }
  };

  return (
    <div style={{ width: el.style?.width ?? '100%' }} className={cn('space-y-1', el.style?.width && el.style.width !== '100%' && 'inline-block pr-3')}>
      {el.type !== 'heading' && el.type !== 'paragraph' && el.type !== 'divider' && el.type !== 'spacer' && (
        <label className={cn('block text-sm font-medium text-gray-700', el.required && "after:content-['*'] after:text-red-500 after:ml-0.5")}>
          {el.label}
          {el.tooltip && <span title={el.tooltip} className="ml-1 text-gray-400 cursor-help">ⓘ</span>}
        </label>
      )}
      {renderInput()}
      {el.helpText && <p className="text-xs text-gray-400">{el.helpText}</p>}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

function RenderSection({ el, ...rest }: { el: SectionElement } & any) {
  const [collapsed, setCollapsed] = useState(el.collapsed ?? false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <span className="font-medium text-gray-700">{el.label}</span>
        {el.collapsible && (
          <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400">{collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}</button>
        )}
      </div>
      {!collapsed && (
        <div className="p-4 space-y-4">
          {el.children.map((child: FormElement) => <RenderElement key={child.id} element={child} {...rest} />)}
        </div>
      )}
    </div>
  );
}

function RenderColumns({ el, ...rest }: { el: ColumnsElement } & any) {
  return (
    <div className="flex gap-4">
      {el.columnDefs.map((col: any) => (
        <div key={col.id} style={{ width: col.width }} className="flex-1 space-y-4">
          {col.children.map((child: FormElement) => <RenderElement key={child.id} element={child} {...rest} />)}
        </div>
      ))}
    </div>
  );
}

function RenderTabs({ el, ...rest }: { el: TabsElement } & any) {
  const [active, setActive] = useState(0);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex border-b border-gray-200 bg-gray-50">
        {el.tabList.map((tab: any, i: number) => (
          <button key={tab.id} onClick={() => setActive(i)} className={cn('px-4 py-2.5 text-sm font-medium border-b-2 transition-colors', i === active ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700')}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 space-y-4">
        {el.tabList[active]?.children.map((child: FormElement) => <RenderElement key={child.id} element={child} {...rest} />)}
      </div>
    </div>
  );
}

function RenderAccordion({ el, ...rest }: { el: AccordionElement } & any) {
  const [open, setOpen] = useState<Set<string>>(new Set(el.panels.filter((p: any) => p.expanded).map((p: any) => p.id)));
  const toggle = (id: string) => setOpen(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
      {el.panels.map((panel: any) => (
        <div key={panel.id}>
          <button onClick={() => toggle(panel.id)} className="flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {panel.label}
            {open.has(panel.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {open.has(panel.id) && (
            <div className="p-4 space-y-4 border-t border-gray-100">
              {panel.children.map((child: FormElement) => <RenderElement key={child.id} element={child} {...rest} />)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RenderFrame({ el, ...rest }: { el: FrameElement } & any) {
  const colorMap: Record<string, any> = {
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: <Info size={16} className="text-blue-600" /> },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: <AlertTriangle size={16} className="text-amber-600" /> },
    success: { bg: 'bg-green-50', border: 'border-green-200', icon: <CheckCircle size={16} className="text-green-600" /> },
    neutral: { bg: 'bg-gray-50', border: 'border-gray-200', icon: <AlertCircle size={16} className="text-gray-500" /> },
  };
  const c = colorMap[el.variant ?? 'info'] ?? colorMap.info;
  return (
    <div className={cn('rounded-xl border p-4', c.bg, c.border)}>
      {el.title && <div className="flex items-center gap-2 font-medium text-sm mb-3">{c.icon}{el.title}</div>}
      <div className="space-y-3">
        {el.children.map((child: FormElement) => <RenderElement key={child.id} element={child} {...rest} />)}
      </div>
    </div>
  );
}
