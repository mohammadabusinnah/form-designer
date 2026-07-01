import type { FormElement, FieldElement, SectionElement, ColumnsElement, TabsElement, AccordionElement, FrameElement, StyleObject, FormTheme } from '../../../types/schema';
import { useState } from 'react';
import { useDesignerStore } from '../../../store/designerStore';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { ElementWrapper } from './ElementWrapper';
import { cn } from '../../../utils/cn';
import { ChevronDown, ChevronRight, Plus, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

// ─── Style resolution ────────────────────────────────────────────────────────

interface ResolvedStyle {
  // field input
  fieldBg: string;
  fieldTextColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  padding: string;
  fontSize: string;
  // label
  labelColor: string;
  labelFontSize?: string;
  labelFontWeight: string;
  // accent (toggles, radio active, slider thumb)
  accentColor: string;
}

function resolveStyle(theme: FormTheme, elStyle?: StyleObject): ResolvedStyle {
  const fontSizeMap: Record<string, string> = { sm: '12px', md: '14px', lg: '16px' };
  const fwMap: Record<string, string> = {
    normal: '400', medium: '500', semibold: '600', bold: '700',
  };
  return {
    fieldBg:        elStyle?.fieldBackground ?? theme.fieldBackground ?? '#ffffff',
    fieldTextColor: elStyle?.fieldTextColor  ?? '#374151',
    borderColor:    elStyle?.borderColor     ?? theme.borderColor     ?? '#e5e7eb',
    borderWidth:    elStyle?.borderWidth     ?? 1,
    borderRadius:   elStyle?.borderRadius    != null ? elStyle.borderRadius : (theme.borderRadius ?? 6),
    padding:        elStyle?.padding         ?? '8px 12px',
    fontSize:       fontSizeMap[elStyle?.fontSize ?? theme.fontSize ?? 'md'] ?? '14px',
    labelColor:     elStyle?.labelColor      ?? theme.labelColor     ?? '#374151',
    labelFontSize:  elStyle?.labelFontSize   ? `${elStyle.labelFontSize}px` : undefined,
    labelFontWeight: fwMap[elStyle?.labelFontWeight ?? 'medium'] ?? '500',
    accentColor:    elStyle?.accentColor     ?? theme.primaryColor   ?? '#6366f1',
  };
}

// ─── Drop Zone for empty containers ────────────────────────────────────────
function EmptyDropZone({ id }: { id: string }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[60px] rounded border-2 border-dashed flex items-center justify-center text-xs text-gray-400 transition-colors',
        isOver ? 'border-indigo-400 bg-indigo-50 text-indigo-500' : 'border-gray-200'
      )}
    >
      Drop fields here
    </div>
  );
}

// ─── Render a list of elements ───────────────────────────────────────────────
function ElementList({ elements, containerId }: { elements: FormElement[]; containerId: string }) {
  return (
    <SortableContext items={elements.map(e => e.id)} strategy={verticalListSortingStrategy}>
      <div className="flex flex-col gap-2">
        {elements.length === 0 && <EmptyDropZone id={containerId} />}
        {elements.map(el => (
          <ElementWrapper key={el.id} element={el}>
            <ControlPreview element={el} />
          </ElementWrapper>
        ))}
      </div>
    </SortableContext>
  );
}

// ─── Individual control previews ─────────────────────────────────────────────
export function ControlPreview({ element }: { element: FormElement }) {
  const { schema } = useDesignerStore();
  const dir = schema.direction;

  switch (element.type) {
    case 'section':   return <SectionPreview   el={element as SectionElement} />;
    case 'columns':   return <ColumnsPreview   el={element as ColumnsElement} />;
    case 'tabs':      return <TabsPreview      el={element as TabsElement} />;
    case 'accordion': return <AccordionPreview el={element as AccordionElement} />;
    case 'frame':     return <FramePreview     el={element as FrameElement} />;
    default:          return <FieldPreview     el={element as FieldElement} dir={dir} theme={schema.theme} />;
  }
}

function FieldPreview({ el, dir, theme }: { el: FieldElement; dir: 'ltr' | 'rtl'; theme: FormTheme }) {
  const rs = resolveStyle(theme, el.style);
  const labelPos = el.style?.labelPosition ?? 'top';
  const isHoriz  = labelPos === 'left' || labelPos === 'right';
  const isHidden = labelPos === 'hidden';

  const labelStyle: React.CSSProperties = {
    color:      rs.labelColor,
    fontSize:   rs.labelFontSize,
    fontWeight: rs.labelFontWeight,
  };

  const label = (
    <label
      className={cn('block text-sm mb-1', isHoriz && 'mb-0 shrink-0 w-32', el.required && "after:content-['*'] after:text-red-500 after:ml-0.5")}
      style={labelStyle}
    >
      {el.label || el.type}
    </label>
  );

  const field = <FieldInput el={el} rs={rs} />;

  return (
    <div className="p-2 bg-white rounded" dir={dir}>
      {el.type === 'heading' ? (
        <div
          className={`font-bold ${el.level === 1 ? 'text-2xl' : el.level === 2 ? 'text-xl' : el.level === 3 ? 'text-lg' : 'text-base'}`}
          style={{ color: rs.labelColor }}
        >
          {(el as any).text || 'Heading'}
        </div>
      ) : el.type === 'paragraph' ? (
        <p className="text-sm" style={{ color: rs.fieldTextColor }}>
          {(el as any).content || 'Paragraph text'}
        </p>
      ) : el.type === 'divider' ? (
        <hr style={{ borderColor: rs.borderColor, borderWidth: rs.borderWidth, margin: `${(el as any).margin ?? 8}px 0` }} />
      ) : el.type === 'spacer' ? (
        <div style={{ height: (el as any).height ?? 24 }} />
      ) : el.type === 'hidden' ? (
        <div className="flex items-center gap-2 text-xs text-gray-400 italic px-2 py-1 bg-gray-50 border border-dashed border-gray-200 rounded">
          Hidden: {el.name}
        </div>
      ) : (
        <div className={cn(isHoriz && 'flex items-center gap-3')}>
          {!isHidden && labelPos !== 'right' && label}
          <div className="flex-1">
            {field}
            {el.helpText && <p className="text-xs text-gray-400 mt-1">{el.helpText}</p>}
          </div>
          {!isHidden && labelPos === 'right' && label}
        </div>
      )}
    </div>
  );
}

function FieldInput({ el, rs }: { el: FieldElement; rs: ResolvedStyle }) {
  // Shared inline style for border-based inputs
  const inputStyle: React.CSSProperties = {
    backgroundColor: rs.fieldBg,
    color:           rs.fieldTextColor,
    borderColor:     rs.borderColor,
    borderWidth:     rs.borderWidth,
    borderStyle:     'solid',
    borderRadius:    rs.borderRadius,
    padding:         rs.padding,
    fontSize:        rs.fontSize,
    width:           '100%',
  };

  const baseClass = 'w-full text-sm pointer-events-none';

  switch (el.type) {
    case 'text': case 'email': case 'phone': case 'url': case 'password':
      return <div className={baseClass} style={inputStyle}>{el.placeholder || el.label}</div>;

    case 'currency':
      return (
        <div className={baseClass} style={inputStyle}>
          {(el as any).prefix}{el.placeholder || '0.00'}{(el as any).suffix}
        </div>
      );

    case 'number':
      return (
        <div className={baseClass} style={inputStyle}>
          {(el as any).prefix}{el.placeholder || '0'}{(el as any).suffix}
        </div>
      );

    case 'longtext':
      return (
        <div className={baseClass} style={{ ...inputStyle, minHeight: 80 }}>
          {el.placeholder || el.label}
        </div>
      );

    case 'dropdown': case 'multiselect':
      return (
        <div className={cn(baseClass, 'flex items-center justify-between')} style={inputStyle}>
          <span style={{ color: '#9ca3af' }}>{el.placeholder || 'Select…'}</span>
          <ChevronDown size={14} style={{ color: '#9ca3af' }} />
        </div>
      );

    case 'radio':
      return (
        <div className="flex flex-col gap-1.5">
          {(el.options ?? []).slice(0, 4).map((o, i) => (
            <label key={o.value} className="flex items-center gap-2 text-sm cursor-default" style={{ color: rs.fieldTextColor, fontSize: rs.fontSize }}>
              <div className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                style={{ borderColor: i === 0 ? rs.accentColor : rs.borderColor }}>
                {i === 0 && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rs.accentColor }} />}
              </div>
              {o.label}
            </label>
          ))}
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex flex-col gap-1.5">
          {(el.options ?? []).slice(0, 4).map((o, i) => (
            <label key={o.value} className="flex items-center gap-2 text-sm cursor-default" style={{ color: rs.fieldTextColor, fontSize: rs.fontSize }}>
              <div className="w-4 h-4 rounded shrink-0 border flex items-center justify-center"
                style={{ borderColor: i === 0 ? rs.accentColor : rs.borderColor, backgroundColor: i === 0 ? rs.accentColor : 'transparent' }}>
                {i === 0 && <span className="text-white text-xs leading-none">✓</span>}
              </div>
              {o.label}
            </label>
          ))}
        </div>
      );

    case 'toggle':
      return (
        <div className="flex items-center gap-2">
          <div className="w-10 h-5 rounded-full relative" style={{ backgroundColor: rs.accentColor }}>
            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
          </div>
          <span className="text-sm" style={{ color: rs.fieldTextColor, fontSize: rs.fontSize }}>{el.onLabel ?? 'On'}</span>
        </div>
      );

    case 'yesno':
      return (
        <div className="flex gap-2">
          <button className="px-4 py-1.5 rounded text-sm pointer-events-none"
            style={{ borderColor: rs.accentColor, borderWidth: 1, borderStyle: 'solid', backgroundColor: rs.accentColor, color: '#fff', fontSize: rs.fontSize, borderRadius: rs.borderRadius }}>
            {(el as any).yesLabel ?? 'Yes'}
          </button>
          <button className="px-4 py-1.5 rounded text-sm pointer-events-none"
            style={{ borderColor: rs.borderColor, borderWidth: rs.borderWidth, borderStyle: 'solid', backgroundColor: rs.fieldBg, color: rs.fieldTextColor, fontSize: rs.fontSize, borderRadius: rs.borderRadius }}>
            {(el as any).noLabel ?? 'No'}
          </button>
        </div>
      );

    case 'buttongroup':
      return (
        <div className="flex gap-1 flex-wrap">
          {(el.options ?? []).map((o, i) => (
            <button key={o.value} className="px-3 py-1.5 text-sm pointer-events-none"
              style={{
                borderRadius: rs.borderRadius,
                borderWidth: rs.borderWidth,
                borderStyle: 'solid',
                borderColor: i === 0 ? rs.accentColor : rs.borderColor,
                backgroundColor: i === 0 ? rs.accentColor : rs.fieldBg,
                color: i === 0 ? '#fff' : rs.fieldTextColor,
                fontSize: rs.fontSize,
              }}>
              {o.label}
            </button>
          ))}
        </div>
      );

    case 'rating': {
      const min = (el as any).min ?? 0;
      const max = (el as any).max ?? 10;
      return (
        <div className="space-y-1">
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(n => (
              <button key={n} className="w-7 h-7 text-xs pointer-events-none flex items-center justify-center"
                style={{ borderRadius: rs.borderRadius, borderWidth: 1, borderStyle: 'solid', borderColor: rs.borderColor, color: rs.fieldTextColor, fontSize: rs.fontSize, backgroundColor: rs.fieldBg }}>
                {n}
              </button>
            ))}
          </div>
          {((el as any).lowLabel || (el as any).highLabel) && (
            <div className="flex justify-between text-xs" style={{ color: '#9ca3af' }}>
              <span>{(el as any).lowLabel}</span>
              <span>{(el as any).highLabel}</span>
            </div>
          )}
        </div>
      );
    }

    case 'starrating': {
      const stars = el.maxStars ?? 5;
      return (
        <div className="flex gap-1">
          {Array.from({ length: stars }, (_, i) => (
            <span key={i} className="text-xl" style={{ color: i < 2 ? rs.accentColor : rs.borderColor }}>★</span>
          ))}
        </div>
      );
    }

    case 'slider': {
      const min = el.min ?? 0;
      const max = el.max ?? 100;
      return (
        <div className="px-1">
          <div className="h-2 rounded-full relative" style={{ backgroundColor: rs.borderColor }}>
            <div className="absolute left-0 top-0 h-full w-1/3 rounded-full" style={{ backgroundColor: rs.accentColor }} />
            <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow -translate-x-1/2"
              style={{ border: `2px solid ${rs.accentColor}` }} />
          </div>
          <div className="flex justify-between text-xs mt-1" style={{ color: '#9ca3af' }}>
            <span>{min}</span><span>{max}</span>
          </div>
        </div>
      );
    }

    case 'date':
    case 'datetime':
    case 'daterange':
    case 'monthpicker':
    case 'yearpicker': {
      const calType = (el as any).calendarType ?? 'gregorian';
      const isUAQ   = calType === 'umm-al-qura';
      const isRange = el.type === 'daterange';
      const isMon   = el.type === 'monthpicker';
      const isYear  = el.type === 'yearpicker';

      // Placeholder values shown in designer
      const gregDate  = '2025-07-02';
      const uaqDate   = '١٤٤٦-١٢-٠٦';
      const gregDT    = '2025-07-02  10:30';
      const uaqDT     = '١٤٤٦-١٢-٠٦  ١٠:٣٠';
      const gregMon   = '2025-07';
      const uaqMon    = '١٤٤٦-١٢';
      const gregYear  = '2025';
      const uaqYear   = '١٤٤٦';

      let startDisplay = isYear ? (isUAQ ? uaqYear : gregYear)
                       : isMon  ? (isUAQ ? uaqMon  : gregMon)
                       : el.type === 'datetime' ? (isUAQ ? uaqDT : gregDT)
                       : (isUAQ ? uaqDate : gregDate);
      let endDisplay   = isYear ? (isUAQ ? uaqYear : gregYear)
                       : isMon  ? (isUAQ ? uaqMon  : gregMon)
                       : (isUAQ ? uaqDate : gregDate);

      const fieldStyle: React.CSSProperties = {
        ...inputStyle,
        display: 'flex', alignItems: 'center', gap: 6,
      };

      const calBadge = isUAQ ? (
        <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', borderRadius: 4, padding: '1px 5px', fontWeight: 600, whiteSpace: 'nowrap' }}>
          أم القرى
        </span>
      ) : null;

      if (isRange) {
        return (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <span style={{ flex: 1, color: '#374151', fontSize: rs.fontSize, fontFamily: isUAQ ? 'monospace' : undefined }}>{startDisplay}</span>
              {calBadge}
              <span style={{ fontSize: 16, color: rs.accentColor, cursor: 'pointer' }}>📅</span>
            </div>
            <span style={{ color: '#9ca3af', fontSize: 12 }}>→</span>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <span style={{ flex: 1, color: '#374151', fontSize: rs.fontSize, fontFamily: isUAQ ? 'monospace' : undefined }}>{endDisplay}</span>
              <span style={{ fontSize: 16, color: rs.accentColor, cursor: 'pointer' }}>📅</span>
            </div>
          </div>
        );
      }

      return (
        <div style={fieldStyle}>
          <span style={{ flex: 1, color: '#374151', fontSize: rs.fontSize, fontFamily: isUAQ ? 'monospace' : undefined }}>
            {startDisplay}
          </span>
          {calBadge}
          <span style={{ fontSize: 16, color: rs.accentColor, cursor: 'pointer' }}>📅</span>
        </div>
      );
    }

    case 'time':
      return (
        <div className={cn(baseClass, 'flex items-center gap-2')} style={inputStyle}>
          <span style={{ flex: 1, color: '#374151', fontSize: rs.fontSize }}>10:30</span>
          <span style={{ fontSize: 16, color: rs.accentColor }}>&#128336;</span>
        </div>
      );

    case 'fileupload':
      return (
        <div className="rounded-lg p-4 text-center text-sm"
          style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: rs.borderColor, borderRadius: rs.borderRadius, backgroundColor: rs.fieldBg, color: '#9ca3af', fontSize: rs.fontSize }}>
          <div className="text-2xl mb-1">&#128206;</div>
          <div>Drop files here or click to browse</div>
          {(el as any).accept && <div className="text-xs mt-1" style={{ color: rs.borderColor }}>{(el as any).accept}</div>}
          {(el as any).multiple && <div className="text-xs mt-0.5" style={{ color: rs.accentColor }}>Multiple files allowed</div>}
        </div>
      );

    case 'signature':
      return (
        <div className="h-24 flex items-center justify-center text-sm"
          style={{ borderWidth: rs.borderWidth, borderStyle: 'solid', borderColor: rs.borderColor, borderRadius: rs.borderRadius, backgroundColor: rs.fieldBg, color: '#9ca3af', fontSize: rs.fontSize }}>
          {String.fromCodePoint(0x270D)} {(el as any).sigLabel ?? 'Sign here'}
        </div>
      );

    case 'richtext': {
      const content = (el as any).defaultContent ?? '';
      return (
        <div style={{ borderWidth: rs.borderWidth, borderStyle: 'solid', borderColor: rs.borderColor, borderRadius: rs.borderRadius, overflow: 'hidden' }}>
          <div className="flex gap-2 px-2 py-1 border-b text-xs" style={{ borderColor: rs.borderColor, backgroundColor: rs.fieldBg, color: rs.fieldTextColor }}>
            {['B','I','U'].map(t => <button key={t} className="px-1 hover:bg-gray-100 rounded pointer-events-none">{t}</button>)}
          </div>
          {content
            ? <div className="p-2 text-sm" style={{ minHeight: 60, backgroundColor: rs.fieldBg, color: rs.fieldTextColor, fontSize: rs.fontSize }} dangerouslySetInnerHTML={{ __html: content }} />
            : <div className="p-2 text-sm" style={{ minHeight: 60, backgroundColor: rs.fieldBg, color: '#9ca3af', fontSize: rs.fontSize }}>Rich text content…</div>
          }
        </div>
      );
    }

    case 'datatable':
      return (
        <div style={{ borderWidth: rs.borderWidth, borderStyle: 'solid', borderColor: rs.borderColor, borderRadius: rs.borderRadius, overflow: 'hidden' }}>
          <div className="flex text-xs font-medium py-1 px-2" style={{ backgroundColor: rs.borderColor, color: rs.fieldTextColor }}>
            <span className="flex-1">Column A</span>
            <span className="flex-1">Column B</span>
            <span className="flex-1">Column C</span>
          </div>
          <div className="px-2 py-1.5 text-xs text-center" style={{ color: '#9ca3af' }}>No rows yet</div>
        </div>
      );

    case 'lookup':
      return (
        <div className={cn(baseClass, 'flex items-center gap-2')} style={inputStyle}>
          <span style={{ flex: 1, color: '#9ca3af' }}>Search…</span>
          <span style={{ color: '#9ca3af', fontSize: 12 }}>&#128269;</span>
        </div>
      );

    case 'calculated':
      return (
        <div className={baseClass} style={{ ...inputStyle, backgroundColor: '#f9fafb', color: '#6b7280' }}>
          = {(el as any).expression || 'formula'}
        </div>
      );

    case 'aiextract': case 'aisuggest': case 'aisummary':
      return (
        <div className={baseClass} style={{ ...inputStyle, backgroundColor: '#f5f3ff', borderColor: '#a78bfa' }}>
          <span style={{ color: '#7c3aed', fontSize: 12 }}>&#10022; AI &middot; {el.type === 'aiextract' ? 'Extract' : el.type === 'aisuggest' ? 'Suggest' : 'Summary'}</span>
        </div>
      );

    case 'confidence':
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: rs.borderColor }}>
            <div className="h-full w-3/4 rounded-full" style={{ backgroundColor: rs.accentColor }} />
          </div>
          <span className="text-xs font-medium" style={{ color: rs.accentColor }}>75%</span>
        </div>
      );

    case 'progressbar': {
      const rawVal = (el as any).value ?? 0;
      const rawMin = (el as any).min ?? 0;
      const rawMax = (el as any).max ?? 100;
      const pct    = rawMax > rawMin ? Math.round(((rawVal - rawMin) / (rawMax - rawMin)) * 100) : 0;
      const barH   = (el as any).barHeight ?? 12;
      const bStyle = (el as any).barStyle ?? 'rounded';
      const barColor   = (el as any).barColor   ?? rs.accentColor;
      const trackColor = (el as any).trackColor ?? rs.borderColor;
      const radius = bStyle === 'flat' ? 0 : barH / 2;
      const showLbl  = (el as any).showLabel !== false;
      const fmt      = (el as any).labelFormat ?? 'percent';
      const labelTxt = fmt === 'value' ? String(rawVal) : fmt === 'fraction' ? `${rawVal}/${rawMax}` : fmt === 'custom' ? ((el as any).customLabel ?? `${pct}%`) : `${pct}%`;
      return (
        <div className="space-y-1">
          {showLbl && <div className="flex justify-between text-xs" style={{ color: rs.labelColor }}><span>{el.label}</span><span>{labelTxt}</span></div>}
          <div style={{ height: barH, backgroundColor: trackColor, borderRadius: radius, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: radius }} />
          </div>
        </div>
      );
    }

    case 'stepindicator': {
      const steps   = (el as any).steps ?? [{ label: 'Step 1' }, { label: 'Step 2' }, { label: 'Step 3' }];
      const active  = (el as any).previewStep ?? 0;
      const sStyle  = (el as any).stepStyle ?? 'numbers';
      const orient  = (el as any).orientation ?? 'horizontal';
      const compColor  = (el as any).completedColor ?? rs.accentColor;
      const activeColor = (el as any).activeColor ?? rs.accentColor;
      const pendColor   = (el as any).pendingColor ?? rs.borderColor;
      const isH = orient === 'horizontal';
      return (
        <div className={cn('flex', isH ? 'flex-row items-center' : 'flex-col gap-3')}>
          {steps.map((s: any, i: number) => {
            const done    = i < active;
            const current = i === active;
            const col     = done ? compColor : current ? activeColor : pendColor;
            return (
              <div key={i} className={cn('flex', isH ? 'flex-col items-center flex-1' : 'flex-row items-center gap-2')}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: done || current ? col : 'transparent', border: `2px solid ${col}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: done || current ? '#fff' : col, flexShrink: 0 }}>
                  {done ? '✓' : sStyle === 'dots' ? '' : i + 1}
                </div>
                {(el as any).showLabels !== false && <div style={{ fontSize: 11, color: done || current ? col : '#9ca3af', marginTop: isH ? 4 : 0 }}>{s.label}</div>}
                {isH && i < steps.length - 1 && <div style={{ height: 2, flex: 1, backgroundColor: done ? compColor : pendColor, margin: '0 2px' }} />}
              </div>
            );
          })}
        </div>
      );
    }

    case 'checklist': {
      const items      = (el as any).items ?? [];
      const checkStyle = (el as any).checkStyle ?? 'check';
      const compColor  = (el as any).completedColor ?? '#22c55e';
      const pendColor  = (el as any).pendingColor ?? rs.borderColor;
      const done = items.filter((it: any) => it.defaultChecked).length;
      return (
        <div className="space-y-2">
          {(el as any).checklistTitle && <div className="text-sm font-medium" style={{ color: rs.labelColor }}>{(el as any).checklistTitle}</div>}
          {items.slice(0, 5).map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-2" style={{ fontSize: rs.fontSize }}>
              <div style={{ width: 18, height: 18, borderRadius: checkStyle === 'circle' ? '50%' : 4, border: `2px solid ${item.defaultChecked ? compColor : pendColor}`, backgroundColor: item.defaultChecked ? compColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.defaultChecked && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
              </div>
              <span style={{ color: item.defaultChecked ? '#9ca3af' : rs.fieldTextColor, textDecoration: item.defaultChecked ? 'line-through' : 'none' }}>{item.label}</span>
            </div>
          ))}
          {(el as any).showCount !== false && <div className="text-xs" style={{ color: rs.accentColor }}>{done}/{items.length} complete</div>}
        </div>
      );
    }

    case 'scorecard': {
      const sections   = (el as any).sections ?? [];
      const thresholds = (el as any).thresholds ?? { low: 40, medium: 70 };
      const lowColor  = (el as any).lowColor    ?? '#ef4444';
      const medColor  = (el as any).mediumColor ?? '#f59e0b';
      const highColor = (el as any).highColor   ?? '#22c55e';
      const totalWeight = sections.reduce((a: number, s: any) => a + (s.weight ?? 1), 0);
      const totalScore  = totalWeight > 0 ? sections.reduce((a: number, s: any) => a + (s.previewScore ?? 0) * (s.weight ?? 1), 0) / totalWeight : 0;
      const scoreColor  = totalScore < thresholds.low ? lowColor : totalScore < thresholds.medium ? medColor : highColor;
      return (
        <div className="space-y-2">
          {(el as any).scorecardTitle && <div className="text-sm font-medium" style={{ color: rs.labelColor }}>{(el as any).scorecardTitle}</div>}
          {sections.map((sec: any, i: number) => {
            const sc = sec.previewScore ?? [82, 65, 74][i % 3];
            const secColor = sc < thresholds.low ? lowColor : sc < thresholds.medium ? medColor : highColor;
            return (
              <div key={i} className="flex items-center justify-between" style={{ fontSize: rs.fontSize }}>
                <span style={{ color: rs.fieldTextColor }}>{sec.label}</span>
                <span style={{ color: secColor, fontWeight: 600 }}>{sc}%</span>
              </div>
            );
          })}
          {(el as any).showTotal !== false && (
            <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: rs.borderColor, fontSize: rs.fontSize }}>
              <span style={{ fontWeight: 600, color: rs.labelColor }}>{(el as any).totalLabel ?? 'Overall Score'}</span>
              <span style={{ color: scoreColor, fontWeight: 700, fontSize: '1.1em' }}>{Math.round(totalScore)}%</span>
            </div>
          )}
        </div>
      );
    }

    case 'summarypill': {
      const tracked   = (el as any).trackedFields ?? [];
      const total     = tracked.length;
      const done      = (el as any).previewDone ?? 0;
      const pillColor = (el as any).pillColor ?? rs.accentColor;
      const pillText  = (el as any).pillTextColor ?? '#ffffff';
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return (
        <div className="flex items-center gap-3">
          <div style={{ backgroundColor: pillColor, color: pillText, borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
            {done}/{total} &middot; {pct}%
          </div>
          <span style={{ fontSize: rs.fontSize, color: rs.fieldTextColor }}>{(el as any).pillLabel ?? 'Form Progress'}</span>
        </div>
      );
    }

    default:
      return (
        <div className={baseClass} style={inputStyle}>
          <span style={{ color: '#9ca3af' }}>{el.label || el.type}</span>
        </div>
      );
  }
}

// ── Container previews ────────────────────────────────────────────

function SectionPreview({ el }: { el: SectionElement }) {
  const { schema } = useDesignerStore();
  const rs = resolveStyle(schema.theme, el.style);
  const [collapsed, setCollapsed] = useState(el.collapsed ?? false);
  return (
    <div className="rounded-lg border" style={{ borderColor: rs.borderColor, backgroundColor: rs.fieldBg }}>
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        style={{ backgroundColor: rs.accentColor + '15', borderRadius: '6px 6px 0 0' }}
        onClick={() => el.collapsible && setCollapsed(!collapsed)}
      >
        <span className="font-medium text-sm" style={{ color: rs.labelColor }}>{el.label || 'Section'}</span>
        {el.collapsible && (collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />)}
      </div>
      {!collapsed && (
        <div className="p-3">
          <ElementList elements={el.children} containerId={el.id} />
        </div>
      )}
    </div>
  );
}

function ColumnsPreview({ el }: { el: ColumnsElement }) {
  const { schema } = useDesignerStore();
  const rs = resolveStyle(schema.theme, el.style);
  return (
    <div className="flex rounded border" style={{ gap: el.gap ?? 12, borderColor: rs.borderColor, padding: 8, backgroundColor: rs.fieldBg }}>
      {el.columnDefs.map(col => (
        <div key={col.id} style={{ width: col.width, minWidth: 0, flex: col.width === 'auto' ? 1 : undefined }}>
          <ElementList elements={col.children} containerId={col.id} />
        </div>
      ))}
    </div>
  );
}

function TabsPreview({ el }: { el: TabsElement }) {
  const { schema } = useDesignerStore();
  const rs = resolveStyle(schema.theme, el.style);
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="rounded border" style={{ borderColor: rs.borderColor, backgroundColor: rs.fieldBg }}>
      <div className="flex border-b" style={{ borderColor: rs.borderColor }}>
        {el.tabList.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(i)}
            className="px-4 py-2 text-sm border-b-2 transition-colors"
            style={{
              borderBottomColor: activeTab === i ? rs.accentColor : 'transparent',
              color: activeTab === i ? rs.accentColor : rs.fieldTextColor,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-3">
        <ElementList elements={el.tabList[activeTab]?.children ?? []} containerId={el.tabList[activeTab]?.id ?? el.id} />
      </div>
    </div>
  );
}

function AccordionPreview({ el }: { el: AccordionElement }) {
  const { schema } = useDesignerStore();
  const rs = resolveStyle(schema.theme, el.style);
  const [openPanels, setOpenPanels] = useState<Set<string>>(new Set(el.panels.filter(p => p.expanded).map(p => p.id)));
  const toggle = (id: string) => {
    if (el.allowMultiple) {
      setOpenPanels(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
    } else {
      setOpenPanels(prev => prev.has(id) ? new Set() : new Set([id]));
    }
  };
  return (
    <div className="rounded border overflow-hidden" style={{ borderColor: rs.borderColor }}>
      {el.panels.map((panel, i) => (
        <div key={panel.id} style={{ borderTopWidth: i > 0 ? 1 : 0, borderTopStyle: 'solid', borderTopColor: rs.borderColor }}>
          <button className="w-full flex items-center justify-between px-3 py-2 text-sm" style={{ backgroundColor: rs.fieldBg }} onClick={() => toggle(panel.id)}>
            <span style={{ fontWeight: 500, color: rs.labelColor }}>{panel.label}</span>
            {openPanels.has(panel.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {openPanels.has(panel.id) && (
            <div className="p-3 border-t" style={{ borderColor: rs.borderColor }}>
              <ElementList elements={panel.children} containerId={panel.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FramePreview({ el }: { el: FrameElement }) {
  const { schema } = useDesignerStore();
  const rs = resolveStyle(schema.theme, el.style);
  const variantColors: Record<string, string> = {
    info: '#3b82f6', warning: '#f59e0b', success: '#22c55e', neutral: '#6b7280', custom: el.accentColor ?? rs.accentColor,
  };
  const accent = variantColors[el.variant ?? 'info'];
  const iconMap: Record<string, React.ReactNode> = {
    info: <Info size={16} />, warning: <AlertTriangle size={16} />, success: <CheckCircle size={16} />, neutral: <AlertCircle size={16} />,
  };
  return (
    <div className="rounded-lg border-l-4 p-3" style={{ borderLeftColor: accent, backgroundColor: accent + '10', borderColor: rs.borderColor, borderWidth: 1, borderStyle: 'solid' }}>
      <div className="flex items-center gap-2 mb-2" style={{ color: accent }}>
        {iconMap[el.variant ?? 'info']}
        {el.title && <span className="font-medium text-sm">{el.title}</span>}
      </div>
      <ElementList elements={el.children} containerId={el.id} />
    </div>
  );
}
