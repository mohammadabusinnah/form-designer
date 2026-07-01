import { create } from 'zustand';
import type { FormDefinition, FormElement, FormPage, LogicRule, FormVariable, Direction } from '../types/schema';
import { genId } from '../utils/idGenerator';
import { createDefaultElement } from '../utils/schemaHelpers';
import type { ControlType } from '../types/schema';

const DEFAULT_FORM: FormDefinition = {
  id: genId('form'),
  version: 1,
  title: 'Untitled Form',
  description: '',
  direction: 'ltr',
  theme: {
    preset: 'default',
    primaryColor: '#6c63ff',
    labelColor: '#1a1a2e',
    fieldBackground: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 6,
    fontSize: 'md',
    density: 'normal',
    fontFamily: 'Inter, sans-serif',
  },
  settings: {
    showProgressBar: true,
    showPageNumbers: true,
    allowSaveDraft: true,
    submitLabel: 'Submit',
    nextLabel: 'Next',
    backLabel: 'Back',
  },
  pages: [
    {
      id: genId('page'),
      type: 'page',
      title: 'Page 1',
      description: '',
      condition: null,
      elements: [],
    },
  ],
  globalLogic: [],
  variables: [],
};

interface DesignerState {
  schema: FormDefinition;
  selectedIds: string[];
  activePageIndex: number;
  isDirty: boolean;
  previewMode: boolean;
  canvasWidth: number;
  // History
  past: FormDefinition[];
  future: FormDefinition[];

  // Selection
  setSelectedIds: (ids: string[]) => void;
  selectElement: (id: string, multi?: boolean) => void;
  clearSelection: () => void;

  // Pages
  setActivePageIndex: (i: number) => void;
  addPage: () => void;
  removePage: (id: string) => void;
  updatePage: (id: string, patch: Partial<FormPage>) => void;

  // Elements
  addElement: (type: ControlType, pageId: string, parentId?: string, index?: number) => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, patch: Partial<FormElement>) => void;
  moveElement: (id: string, targetPageId: string, targetParentId: string | null, targetIndex: number) => void;
  duplicateElement: (id: string) => void;

  // Form
  updateSchema: (patch: Partial<FormDefinition>) => void;
  setDirection: (dir: Direction) => void;
  setTitle: (title: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  _pushHistory: () => void;

  // Preview
  setPreviewMode: (v: boolean) => void;
  setIsDirty: (v: boolean) => void;
  setCanvasWidth: (w: number) => void;
}

function removeFromPage(pages: FormPage[], id: string): { pages: FormPage[]; removed: FormElement | null } {
  let removed: FormElement | null = null;
  const newPages = pages.map(page => ({
    ...page,
    elements: removeFromList(page.elements, id, (el) => { removed = el; }),
  }));
  return { pages: newPages, removed };
}

function removeFromList(elements: FormElement[], id: string, onRemove?: (el: FormElement) => void): FormElement[] {
  return elements.reduce<FormElement[]>((acc, el) => {
    if (el.id === id) { onRemove?.(el); return acc; }
    const clone = { ...el } as FormElement;
    if ('children' in clone && Array.isArray((clone as any).children)) {
      (clone as any).children = removeFromList((clone as any).children, id, onRemove);
    }
    if ('columnDefs' in clone) {
      (clone as any).columnDefs = (clone as any).columnDefs.map((c: any) => ({ ...c, children: removeFromList(c.children, id, onRemove) }));
    }
    if ('tabList' in clone) {
      (clone as any).tabList = (clone as any).tabList.map((t: any) => ({ ...t, children: removeFromList(t.children, id, onRemove) }));
    }
    if ('panels' in clone && Array.isArray((clone as any).panels)) {
      (clone as any).panels = (clone as any).panels.map((p: any) => ({ ...p, children: removeFromList(p.children, id, onRemove) }));
    }
    acc.push(clone);
    return acc;
  }, []);
}

function insertIntoPage(pages: FormPage[], pageId: string, element: FormElement, parentId: string | null, index: number): FormPage[] {
  return pages.map(page => {
    if (page.id !== pageId) return page;
    if (!parentId) {
      const els = [...page.elements];
      els.splice(index, 0, element);
      return { ...page, elements: els };
    }
    return { ...page, elements: insertIntoList(page.elements, parentId, element, index) };
  });
}

function insertIntoList(elements: FormElement[], parentId: string, element: FormElement, index: number): FormElement[] {
  return elements.map(el => {
    if (el.id === parentId) {
      if ('children' in el) {
        const ch = [...(el as any).children];
        ch.splice(index, 0, element);
        return { ...el, children: ch };
      }
      return el;
    }
    const clone = { ...el } as any;
    if ('children' in clone) clone.children = insertIntoList(clone.children, parentId, element, index);
    if ('columnDefs' in clone) {
      clone.columnDefs = clone.columnDefs.map((c: any) => {
        if (c.id === parentId) {
          const ch = [...c.children];
          ch.splice(Math.min(index, ch.length), 0, element);
          return { ...c, children: ch };
        }
        return { ...c, children: insertIntoList(c.children, parentId, element, index) };
      });
    }
    if ('tabList' in clone) {
      clone.tabList = clone.tabList.map((t: any) => {
        if (t.id === parentId) {
          const ch = [...t.children];
          ch.splice(Math.min(index, ch.length), 0, element);
          return { ...t, children: ch };
        }
        return { ...t, children: insertIntoList(t.children, parentId, element, index) };
      });
    }
    if ('panels' in clone) {
      clone.panels = clone.panels.map((p: any) => {
        if (p.id === parentId) {
          const ch = [...p.children];
          ch.splice(Math.min(index, ch.length), 0, element);
          return { ...p, children: ch };
        }
        return { ...p, children: insertIntoList(p.children, parentId, element, index) };
      });
    }
    return clone;
  });
}

function updateInList(elements: FormElement[], id: string, patch: Partial<FormElement>): FormElement[] {
  return elements.map(el => {
    if (el.id === id) return { ...el, ...patch } as FormElement;
    const clone = { ...el } as any;
    if ('children' in clone) clone.children = updateInList(clone.children, id, patch);
    if ('columnDefs' in clone) clone.columnDefs = clone.columnDefs.map((c: any) => ({ ...c, children: updateInList(c.children, id, patch) }));
    if ('tabList' in clone) clone.tabList = clone.tabList.map((t: any) => ({ ...t, children: updateInList(t.children, id, patch) }));
    if ('panels' in clone) clone.panels = clone.panels.map((p: any) => ({ ...p, children: updateInList(p.children, id, patch) }));
    return clone;
  });
}

export const useDesignerStore = create<DesignerState>((set, get) => ({
  schema: DEFAULT_FORM,
  selectedIds: [],
  activePageIndex: 0,
  isDirty: false,
  previewMode: false,
  canvasWidth: 768,
  past: [],
  future: [],

  setSelectedIds: (ids) => set({ selectedIds: ids }),
  selectElement: (id, multi = false) => set(s => ({
    selectedIds: multi
      ? s.selectedIds.includes(id) ? s.selectedIds.filter(x => x !== id) : [...s.selectedIds, id]
      : [id],
  })),
  clearSelection: () => set({ selectedIds: [] }),

  setActivePageIndex: (i) => set({ activePageIndex: i }),
  addPage: () => {
    get()._pushHistory();
    set(s => ({
      isDirty: true,
      schema: {
        ...s.schema,
        pages: [...s.schema.pages, {
          id: genId('page'), type: 'page',
          title: `Page ${s.schema.pages.length + 1}`,
          description: '', condition: null, elements: [],
        }],
      },
      activePageIndex: s.schema.pages.length,
    }));
  },
  removePage: (id) => {
    get()._pushHistory();
    set(s => {
      const pages = s.schema.pages.filter(p => p.id !== id);
      return { isDirty: true, schema: { ...s.schema, pages }, activePageIndex: Math.max(0, s.activePageIndex - 1) };
    });
  },
  updatePage: (id, patch) => {
    set(s => ({
      isDirty: true,
      schema: { ...s.schema, pages: s.schema.pages.map(p => p.id === id ? { ...p, ...patch } : p) },
    }));
  },

  addElement: (type, pageId, parentId, index = 0) => {
    get()._pushHistory();
    const el = createDefaultElement(type);
    set(s => ({
      isDirty: true,
      selectedIds: [el.id],
      schema: { ...s.schema, pages: insertIntoPage(s.schema.pages, pageId, el, parentId ?? null, index) },
    }));
  },
  removeElement: (id) => {
    get()._pushHistory();
    set(s => ({
      isDirty: true,
      selectedIds: s.selectedIds.filter(x => x !== id),
      schema: { ...s.schema, pages: removeFromPage(s.schema.pages, id).pages },
    }));
  },
  updateElement: (id, patch) => {
    set(s => ({
      isDirty: true,
      schema: { ...s.schema, pages: s.schema.pages.map(p => ({ ...p, elements: updateInList(p.elements, id, patch) })) },
    }));
  },
  moveElement: (id, targetPageId, targetParentId, targetIndex) => {
    get()._pushHistory();
    set(s => {
      const { pages, removed } = removeFromPage(s.schema.pages, id);
      if (!removed) return {};
      const newPages = insertIntoPage(pages, targetPageId, removed, targetParentId, targetIndex);
      return { isDirty: true, schema: { ...s.schema, pages: newPages } };
    });
  },
  duplicateElement: (id) => {
    get()._pushHistory();
    set(s => {
      const { pages, removed } = removeFromPage(s.schema.pages, id);
      if (!removed) return {};
      // re-insert original
      const orig = s.schema.pages;
      // find position in original
      let foundPageId = '';
      let foundIndex = 0;
      for (const p of orig) {
        const idx = p.elements.findIndex(e => e.id === id);
        if (idx !== -1) { foundPageId = p.id; foundIndex = idx; break; }
      }
      if (!foundPageId) return {};
      const dupe = { ...JSON.parse(JSON.stringify(removed)), id: genId() };
      const newPages = insertIntoPage(orig, foundPageId, dupe, null, foundIndex + 1);
      return { isDirty: true, schema: { ...s.schema, pages: newPages }, selectedIds: [dupe.id] };
    });
  },

  updateSchema: (patch) => set(s => ({ isDirty: true, schema: { ...s.schema, ...patch } })),
  setDirection: (dir) => set(s => ({ isDirty: true, schema: { ...s.schema, direction: dir } })),
  setTitle: (title) => set(s => ({ isDirty: true, schema: { ...s.schema, title } })),

  _pushHistory: () => set(s => ({ past: [...s.past.slice(-50), s.schema], future: [] })),
  undo: () => set(s => {
    if (!s.past.length) return {};
    const past = [...s.past];
    const schema = past.pop()!;
    return { schema, past, future: [s.schema, ...s.future] };
  }),
  redo: () => set(s => {
    if (!s.future.length) return {};
    const [schema, ...future] = s.future;
    return { schema, future, past: [...s.past, s.schema] };
  }),

  setPreviewMode: (v) => set({ previewMode: v }),
  setIsDirty: (v) => set({ isDirty: v }),
  setCanvasWidth: (w) => set({ canvasWidth: w }),
}));
