import type { ControlType, FormElement, FieldElement, SectionElement, ColumnsElement, TabsElement, AccordionElement, FrameElement } from '../types/schema';
import { genId } from '../utils/idGenerator';

export interface ControlMeta {
  type: ControlType;
  label: string;
  category: 'basic' | 'choice' | 'datetime' | 'layout' | 'advanced' | 'ai' | 'progress';
  icon: string;
  isContainer?: boolean;
}

export const CONTROL_REGISTRY: ControlMeta[] = [
  // Basic
  { type: 'text', label: 'Text Input', category: 'basic', icon: 'Type' },
  { type: 'number', label: 'Number', category: 'basic', icon: 'Hash' },
  { type: 'longtext', label: 'Long Text', category: 'basic', icon: 'AlignLeft' },
  { type: 'email', label: 'Email', category: 'basic', icon: 'Mail' },
  { type: 'phone', label: 'Phone', category: 'basic', icon: 'Phone' },
  { type: 'password', label: 'Password', category: 'basic', icon: 'Lock' },
  { type: 'currency', label: 'Currency', category: 'basic', icon: 'DollarSign' },
  { type: 'url', label: 'URL', category: 'basic', icon: 'Link' },
  { type: 'hidden', label: 'Hidden Field', category: 'basic', icon: 'EyeOff' },
  // Choice
  { type: 'dropdown', label: 'Dropdown', category: 'choice', icon: 'ChevronDown' },
  { type: 'multiselect', label: 'Multi-Select', category: 'choice', icon: 'ListChecks' },
  { type: 'radio', label: 'Radio Group', category: 'choice', icon: 'Circle' },
  { type: 'checkbox', label: 'Checkbox Group', category: 'choice', icon: 'CheckSquare' },
  { type: 'toggle', label: 'Toggle', category: 'choice', icon: 'ToggleLeft' },
  { type: 'rating', label: 'Rating Scale', category: 'choice', icon: 'BarChart2' },
  { type: 'slider', label: 'Slider', category: 'choice', icon: 'Sliders' },
  { type: 'starrating', label: 'Star Rating', category: 'choice', icon: 'Star' },
  { type: 'buttongroup', label: 'Button Group', category: 'choice', icon: 'ToggleLeft' },
  { type: 'yesno', label: 'Yes / No', category: 'choice', icon: 'ThumbsUp' },
  // Date & Time
  { type: 'date', label: 'Date', category: 'datetime', icon: 'Calendar' },
  { type: 'time', label: 'Time', category: 'datetime', icon: 'Clock' },
  { type: 'datetime', label: 'Date & Time', category: 'datetime', icon: 'CalendarClock' },
  { type: 'daterange', label: 'Date Range', category: 'datetime', icon: 'CalendarRange' },
  // Layout
  { type: 'section', label: 'Section', category: 'layout', icon: 'Square', isContainer: true },
  { type: 'columns', label: 'Column Layout', category: 'layout', icon: 'Columns', isContainer: true },
  { type: 'tabs', label: 'Tabs', category: 'layout', icon: 'Layers', isContainer: true },
  { type: 'accordion', label: 'Accordion', category: 'layout', icon: 'ChevronsUpDown', isContainer: true },
  { type: 'frame', label: 'Frame', category: 'layout', icon: 'FrameIcon', isContainer: true },
  { type: 'divider', label: 'Divider', category: 'layout', icon: 'Minus' },
  { type: 'spacer', label: 'Spacer', category: 'layout', icon: 'Space' },
  { type: 'heading', label: 'Heading', category: 'layout', icon: 'Heading' },
  { type: 'paragraph', label: 'Paragraph', category: 'layout', icon: 'AlignLeft' },
  // Advanced
  { type: 'fileupload', label: 'File Upload', category: 'advanced', icon: 'Upload' },
  { type: 'signature', label: 'Signature Pad', category: 'advanced', icon: 'PenTool' },
  { type: 'datatable', label: 'Data Table', category: 'advanced', icon: 'Table' },
  { type: 'richtext', label: 'Rich Text', category: 'advanced', icon: 'FileText' },
  { type: 'lookup', label: 'Lookup', category: 'advanced', icon: 'Search' },
  { type: 'calculated', label: 'Calculated Field', category: 'advanced', icon: 'Calculator' },
  // AI
  { type: 'aiextract', label: 'AI Extract', category: 'ai', icon: 'Sparkles' },
  { type: 'aisuggest', label: 'AI Suggest', category: 'ai', icon: 'Lightbulb' },
  { type: 'confidence', label: 'Confidence', category: 'ai', icon: 'Activity' },
  { type: 'aisummary', label: 'AI Summary', category: 'ai', icon: 'FileSearch' },
  // Progress
  { type: 'progressbar',    label: 'Progress Bar',    category: 'progress', icon: 'BarChart2' },
  { type: 'stepindicator',  label: 'Step Indicator',  category: 'progress', icon: 'ListOrdered' },
  { type: 'checklist',      label: 'Checklist',       category: 'progress', icon: 'ClipboardList' },
  { type: 'scorecard',      label: 'Score Card',      category: 'progress', icon: 'Award' },
  { type: 'summarypill',    label: 'Summary Pill',    category: 'progress', icon: 'Gauge' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  basic: 'Basic',
  choice: 'Choice',
  datetime: 'Date & Time',
  layout: 'Layout',
  advanced: 'Advanced',
  ai: 'AI Fields',
  progress: 'Progress & Tracking',
};

export function defaultElementForType(type: ControlType): FormElement {
  const id = genId();
  const name = `${type}_${id.slice(-4)}`;

  const containers: ControlType[] = ['section', 'columns', 'tabs', 'accordion', 'frame'];
  if (!containers.includes(type)) {
    const field: FieldElement = {
      id, type, name,
      label: CONTROL_REGISTRY.find(c => c.type === type)?.label ?? type,
      required: false, readOnly: false, visible: true,
      style: {}, logic: [],
    };
    // defaults
    if (type === 'longtext') { field.rows = 4; }
    if (type === 'number' || type === 'currency' || type === 'slider') { field.min = 0; field.max = 100; }
    if (type === 'rating') { field.min = 0; field.max = 10; field.minLabel = 'Not likely'; field.maxLabel = 'Very likely'; }
    if (type === 'starrating') { field.maxStars = 5; }
    if (type === 'toggle') { field.onValue = 'true'; field.offValue = 'false'; field.onLabel = 'Yes'; field.offLabel = 'No'; }
    if (['dropdown', 'multiselect', 'radio', 'checkbox', 'buttongroup', 'yesno'].includes(type)) {
      field.options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ];
    }
    if (type === 'heading') { field.level = 2; field.text = 'Heading'; }
    if (type === 'paragraph') { field.content = 'Enter paragraph text here.'; }
    if (type === 'spacer') { field.height = 24; }
    if (type === 'divider') { field.lineStyle = 'solid'; field.margin = 16; }
    if (type === 'fileupload') { field.maxFiles = 5; field.maxSizeKB = 10240; field.dragDrop = true; }
    if (type === 'calculated') { field.expression = ''; field.readOnly = true; }

    // ── Progress controls ──────────────────────────────────────────────────
    if (type === 'progressbar') {
      Object.assign(field, {
        valueField: '',
        min: 0,
        max: 100,
        showLabel: true,
        labelFormat: 'percent',
        customLabel: '{value} of {max} complete',
        barColor: '#6366f1',
        trackColor: '#e5e7eb',
        barHeight: 12,
        barStyle: 'rounded',
        animateOnLoad: true,
      });
    }
    if (type === 'stepindicator') {
      Object.assign(field, {
        steps: [
         { id: 'step1', label: 'Step 1', description: '' },
          { id: 'step2', label: 'Step 2', description: '' },
          { id: 'step3', label: 'Step 3', description: '' },
        ],
        currentStepField: '',
        completedStepsField: '',
        stepStyle: 'numbers',
        orientation: 'horizontal',
        showLabels: true,
        showDescriptions: false,
        showConnectors: true,
        clickable: false,
        completedColor: '#6366f1',
        activeColor: '#6366f1',
        pendingColor: '#e5e7eb',
        previewStep: 0,
      });
    }
    if (type === 'checklist') {
      Object.assign(field, {
        checklistTitle: 'Checklist',
        items: [
          { id: 'item1', label: 'Item 1', fieldBinding: '', required: false, defaultChecked: false },
          { id: 'item2', label: 'Item 2', fieldBinding: '', required: false, defaultChecked: false },
        ],
        showCount: true,
        showPercentage: false,
        checkStyle: 'check',
        layout: 'list',
        gridColumns: 2,
        completedColor: '#22c55e',
        pendingColor: '#e5e7eb',
        showOnlyIncomplete: false,
      });
    }
    if (type === 'scorecard') {
      Object.assign(field, {
        scorecardTitle: 'Score Card',
        sections: [
          { id: 'sec1', label: 'Section 1', fields: [], weight: 1, previewScore: 75 },
        ],
        showTotal: true,
        showPerSection: true,
        totalLabel: 'Overall Score',
        maxScore: 100,
        scoreFormat: 'percent',
        thresholds: { low: 40, medium: 70, high: 90 },
        lowColor: '#ef4444',
        mediumColor: '#f59e0b',
        highColor: '#22c55e',
      });
    }
    if (type === 'summarypill') {
      Object.assign(field, {
        pillLabel: 'Form Progress',
        trackedFields: [],
        requiredOnly: true,
        showIcon: true,
        showMissingFields: true,
        pillPosition: 'inline',
        pillColor: '#6366f1',
        pillTextColor: '#ffffff',
        expandOnHover: true,
        completionMessage: 'All done!',
        previewDone: 0,
      });
    }

    return field;
  }

  if (type === 'section') {
    return {
      id, type: 'section', name, label: 'Section',
      collapsible: false, collapsed: false, repeatable: false,
      repeatMin: 1, repeatMax: 10, repeatAddLabel: 'Add Another',
      children: [], style: {}, logic: [],
    } as SectionElement;
  }
  if (type === 'columns') {
    return {
      id, type: 'columns', name,
      columnDefs: [
        { id: id + '_c1', width: '50%', children: [] },
        { id: id + '_c2', width: '50%', children: [] },
      ],
      gap: 16, style: {}, logic: [],
    } as ColumnsElement;
  }
  if (type === 'tabs') {
    return {
      id, type: 'tabs', name,
      tabList: [
        { id: id + '_t1', label: 'Tab 1', children: [] },
        { id: id + '_t2', label: 'Tab 2', children: [] },
      ],
      tabPosition: 'top', variant: 'line', style: {}, logic: [],
    } as TabsElement;
  }
  if (type === 'accordion') {
    return {
      id, type: 'accordion', name,
      allowMultiple: false,
      panels: [
        { id: id + '_p1', label: 'Panel 1', expanded: true, children: [] },
      ],
      style: {}, logic: [],
    } as AccordionElement;
  }
  return {
    id, type: 'frame', name, title: 'Notice',
    icon: 'info', variant: 'info', accentColor: '#3b82f6',
    children: [], style: {}, logic: [],
  } as FrameElement;
}
