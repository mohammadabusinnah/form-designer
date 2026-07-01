import type { FormDefinition, FormElement, FormPage, ControlType, FieldElement, SectionElement, ColumnsElement, TabsElement, AccordionElement, FrameElement } from '../types/schema';
import { genId } from './idGenerator';
import { defaultElementForType } from '../controls/registry';

// Deep find element by id, returning it and its parent array
export function findElementInPages(
  pages: FormPage[],
  id: string
): { element: FormElement; container: FormElement[]; index: number } | null {
  for (const page of pages) {
    const r = findInChildren(page.elements, id);
    if (r) return r;
  }
  return null;
}

function findInChildren(
  children: FormElement[],
  id: string
): { element: FormElement; container: FormElement[]; index: number } | null {
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.id === id) return { element: el, container: children, index: i };
    const sub = getChildren(el);
    if (sub) {
      const r = findInChildren(sub, id);
      if (r) return r;
    }
  }
  return null;
}

export function getChildren(el: FormElement): FormElement[] | null {
  switch (el.type) {
    case 'section': return (el as SectionElement).children;
    case 'frame': return (el as FrameElement).children;
    case 'columns': return (el as ColumnsElement).columnDefs.flatMap(c => c.children);
    case 'tabs': return (el as TabsElement).tabList.flatMap(t => t.children);
    case 'accordion': return (el as AccordionElement).panels.flatMap(p => p.children);
    default: return null;
  }
}

export function createDefaultElement(type: ControlType): FormElement {
  return defaultElementForType(type);
}

export function cloneElement(el: FormElement): FormElement {
  return JSON.parse(JSON.stringify({ ...el, id: genId() }));
}

export function collectAllFieldNames(pages: FormPage[]): string[] {
  const names: string[] = [];
  function walk(elements: FormElement[]) {
    for (const el of elements) {
      if ('name' in el && el.name) names.push(el.name);
      const ch = getChildren(el);
      if (ch) walk(ch);
    }
  }
  for (const p of pages) walk(p.elements);
  return names;
}

export function collectAllElements(pages: FormPage[]): FormElement[] {
  const all: FormElement[] = [];
  function walk(elements: FormElement[]) {
    for (const el of elements) {
      all.push(el);
      const ch = getChildren(el);
      if (ch) walk(ch);
    }
  }
  for (const p of pages) walk(p.elements);
  return all;
}
