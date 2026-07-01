// ─── Style ─────────────────────────────────────────────────────────────────
export interface StyleObject {
  labelColor?: string | null;
  labelFontSize?: number | null;
  labelFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | null;
  fieldBackground?: string | null;
  fieldTextColor?: string | null;
  borderColor?: string | null;
  borderWidth?: number | null;
  borderRadius?: number | null;
  accentColor?: string | null;
  errorColor?: string | null;
  focusRingColor?: string | null;
  padding?: string | null;
  width?: '25%' | '33%' | '50%' | '66%' | '75%' | '100%' | string | null;
  labelPosition?: 'top' | 'left' | 'right' | 'hidden' | 'floating' | null;
  fontSize?: 'sm' | 'md' | 'lg' | null;
  density?: 'compact' | 'normal' | 'comfortable' | null;
  backgroundColor?: string | null;
  shadow?: string | null;
}

// ─── Validation ─────────────────────────────────────────────────────────────
export interface ValidationRule {
  id: string;
  expression: string;
  message: string;
}

export interface ValidationConfig {
  minLength?: number | null;
  maxLength?: number | null;
  min?: number | null;
  max?: number | null;
  pattern?: string | null;
  patternMessage?: string | null;
  minSelections?: number | null;
  maxSelections?: number | null;
  customRules?: ValidationRule[];
}

// ─── Data Binding ───────────────────────────────────────────────────────────
export interface StaticOption {
  value: string;
  label: string;
  image?: string;
}

export interface ApiConfig {
  url: string;
  method: 'GET' | 'POST';
  valueField: string;
  labelField: string;
  headers?: Record<string, string>;
}

export interface AiFabricConfig {
  datasetId: string;
  valueField: string;
  labelField: string;
  filters?: Array<{ field: string; op: string; value: unknown }>;
}

export interface DataBinding {
  source: 'static' | 'api' | 'aifabric' | 'variable';
  staticOptions?: StaticOption[];
  apiConfig?: ApiConfig;
  aiFabricConfig?: AiFabricConfig;
  variableName?: string;
}

// ─── Logic ──────────────────────────────────────────────────────────────────
export type ConditionOperator =
  | 'equals' | 'notEquals' | 'contains' | 'notContains'
  | 'startsWith' | 'endsWith'
  | 'greaterThan' | 'lessThan' | 'between'
  | 'isEmpty' | 'isNotEmpty'
  | 'in' | 'notIn' | 'matchesPattern'
  | 'checked' | 'unchecked';

export type ActionType =
  | 'show' | 'hide' | 'enable' | 'disable'
  | 'require' | 'unrequire'
  | 'setValue' | 'clearValue'
  | 'jumpToPage' | 'addError' | 'triggerAiExtract';

export interface Condition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value?: unknown;
}

export interface ConditionGroup {
  operator: 'AND' | 'OR';
  rules: Condition[];
}

export interface LogicAction {
  id: string;
  type: ActionType;
  target: string;
  value?: unknown;
}

export interface LogicRule {
  id: string;
  name: string;
  conditions: ConditionGroup;
  actions: LogicAction[];
}

// ─── Elements ───────────────────────────────────────────────────────────────
export type ControlType =
  // Basic
  | 'text' | 'number' | 'longtext' | 'email' | 'phone'
  | 'password' | 'currency' | 'url' | 'hidden'
  // Choice
  | 'dropdown' | 'multiselect' | 'radio' | 'checkbox'
  | 'toggle' | 'rating' | 'slider' | 'starrating'
  | 'buttongroup' | 'yesno' | 'imagechoice'
  // Date/Time
  | 'date' | 'time' | 'datetime' | 'daterange'
  | 'monthpicker' | 'yearpicker'
  // Layout
  | 'section' | 'columns' | 'tabs' | 'accordion'
  | 'frame' | 'divider' | 'spacer' | 'heading' | 'paragraph'
  // Advanced
  | 'fileupload' | 'signature' | 'imagepicker' | 'datatable'
  | 'richtext' | 'address' | 'lookup' | 'barcode' | 'captcha'
  | 'calculated' | 'mappicker'
  // AI
  | 'aiextract' | 'aisuggest' | 'confidence' | 'aisummary'
  // Progress
  | 'progressbar' | 'stepindicator' | 'checklist' | 'scorecard' | 'summarypill';

export type Direction = 'ltr' | 'rtl';

export interface BaseElement {
  id: string;
  type: ControlType;
  name: string;
  style?: StyleObject;
  logic?: LogicRule[];
  direction?: Direction;
}

export interface FieldElement extends BaseElement {
  label: string;
  placeholder?: string;
  helpText?: string;
  tooltip?: string;
  defaultValue?: unknown;
  required?: boolean;
  readOnly?: boolean;
  visible?: boolean;
  validation?: ValidationConfig;
  dataBinding?: DataBinding | null;
  cssClass?: string;
  // type-specific extras stored as flat props
  inputType?: string;
  rows?: number;
  autoResize?: boolean;
  showCharCount?: boolean;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  format?: string;
  currencyCode?: string;
  searchable?: boolean;
  clearable?: boolean;
  options?: StaticOption[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
  maxSelections?: number;
  onValue?: string;
  offValue?: string;
  onLabel?: string;
  offLabel?: string;
  minLabel?: string;
  maxLabel?: string;
  maxStars?: number;
  allowHalf?: boolean;
  icon?: string;
  calendarType?: 'gregorian' | 'hijri' | 'both';
  timeFormat?: '12h' | '24h';
  minuteStep?: number;
  showSeconds?: boolean;
  accept?: string;
  maxFiles?: number;
  maxSizeKB?: number;
  dragDrop?: boolean;
  penColor?: string;
  outputFormat?: string;
  toolbar?: string[];
  expression?: string;
  dependencies?: string[];
  provider?: string;
  sourceField?: string;
  extractionPrompt?: string;
  suggestionPrompt?: string;
  contextFields?: string[];
  modelPolicy?: string;
  editable?: boolean;
  showConfidence?: boolean;
  linkedField?: string;
  thresholds?: { low: number; medium: number; high: number };
  regenerateButton?: boolean;
  level?: 1 | 2 | 3 | 4;
  text?: string;
  alignment?: 'left' | 'center' | 'right';
  color?: string;
  content?: string;
  height?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  margin?: number;
}

export interface ColumnSlot {
  id: string;
  width: string;
  children: FormElement[];
}

export interface TabPanel {
  id: string;
  label: string;
  children: FormElement[];
}

export interface AccordionPanel {
  id: string;
  label: string;
  expanded: boolean;
  children: FormElement[];
}

export interface SectionElement extends BaseElement {
  type: 'section';
  label: string;
  collapsible?: boolean;
  collapsed?: boolean;
  repeatable?: boolean;
  repeatMin?: number;
  repeatMax?: number;
  repeatAddLabel?: string;
  children: FormElement[];
  backgroundColor?: string;
}

export interface ColumnsElement extends BaseElement {
  type: 'columns';
  columnDefs: ColumnSlot[];
  gap?: number;
}

export interface TabsElement extends BaseElement {
  type: 'tabs';
  tabList: TabPanel[];
  tabPosition?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'line' | 'pill' | 'boxed';
}

export interface AccordionElement extends BaseElement {
  type: 'accordion';
  allowMultiple?: boolean;
  panels: AccordionPanel[];
}

export interface FrameElement extends BaseElement {
  type: 'frame';
  title?: string;
  icon?: string;
  variant?: 'info' | 'warning' | 'success' | 'neutral' | 'custom';
  accentColor?: string;
  children: FormElement[];
}

export type ContainerElement = SectionElement | ColumnsElement | TabsElement | AccordionElement | FrameElement;
export type FormElement = FieldElement | ContainerElement;

// ─── Page ───────────────────────────────────────────────────────────────────
export interface FormPage {
  id: string;
  type: 'page';
  title: string;
  description?: string;
  condition?: LogicRule | null;
  elements: FormElement[];
}

// ─── Theme ──────────────────────────────────────────────────────────────────
export interface FormTheme {
  preset: 'default' | 'corporate' | 'modern' | 'dark' | 'high-contrast' | 'arabic-classic' | 'custom';
  primaryColor: string;
  labelColor: string;
  fieldBackground: string;
  borderColor: string;
  borderRadius: number;
  fontSize: 'sm' | 'md' | 'lg';
  density: 'compact' | 'normal' | 'comfortable';
  fontFamily: string;
}

// ─── Form Variable ───────────────────────────────────────────────────────────
export interface FormVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object';
  expression?: string;
  scope: 'local' | 'runtime';
  source?: string;
}

// ─── Form Settings ──────────────────────────────────────────────────────────
export interface FormSettings {
  showProgressBar: boolean;
  showPageNumbers: boolean;
  allowSaveDraft: boolean;
  submitLabel: string;
  nextLabel: string;
  backLabel: string;
}

// ─── Root Form ──────────────────────────────────────────────────────────────
export interface FormDefinition {
  id: string;
  version: number;
  title: string;
  description: string;
  direction: Direction;
  theme: FormTheme;
  settings: FormSettings;
  pages: FormPage[];
  globalLogic: LogicRule[];
  variables: FormVariable[];
}
