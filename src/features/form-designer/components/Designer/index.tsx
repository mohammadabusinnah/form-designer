import { useEffect, useCallback, useState } from 'react';
import {
  DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { useDesignerStore } from '../../store/designerStore';
import { Toolbar } from './Toolbar';
import { Toolbox } from './Toolbox';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './Properties';
import { CONTROL_REGISTRY } from '../../controls/registry';
import { DevicePreview } from './DevicePreview';
import type { ControlType } from '../../types/schema';
import * as Icons from '@/lib/icons';

export function FormDesigner() {
  const { schema, activePageIndex, addElement, moveElement, undo, redo, previewMode } = useDesignerStore();
  const [activeDragType, setActiveDragType] = useState<string | null>(null);
  const [activeMeta, setActiveMeta] = useState<(typeof CONTROL_REGISTRY)[0] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { data } = event.active;
    if (data.current?.fromToolbox) {
      const type = data.current.controlType as ControlType;
      setActiveDragType(type);
      setActiveMeta(CONTROL_REGISTRY.find(c => c.type === type) ?? null);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragType(null);
    setActiveMeta(null);
    const { active, over } = event;
    if (!over) return;

    const fromToolbox = active.data.current?.fromToolbox;
    const activePage = schema.pages[activePageIndex];
    if (!activePage) return;

    if (fromToolbox) {
      const type = active.data.current?.controlType as ControlType;
      const overId = String(over.id);
      // Ignore drops back onto the toolbox
      if (overId.startsWith('toolbox-')) return;
      const pageId = activePage.id;
      const isPageDrop = overId.startsWith('page-') || overId === pageId;
      // overId may be a column/tab/panel container id, or an element id inside one.
      // Pass it as parentId — insertIntoList now handles both cases.
      const parentId = isPageDrop ? undefined : overId;
      // When dropping on an existing element, use index 0 to prepend; otherwise append.
      const idx = isPageDrop ? activePage.elements.length : 0;
      addElement(type, pageId, parentId, idx);
    } else {
      const elementId = active.data.current?.elementId as string;
      const overId = String(over.id);
      const targetIndex = activePage.elements.findIndex(e => e.id === overId);
      if (elementId && targetIndex !== -1 && elementId !== overId) {
        moveElement(elementId, activePage.id, null, targetIndex);
      }
    }
  }, [schema, activePageIndex, addElement, moveElement]);

  const DragIcon = activeMeta ? ((Icons as any)[activeMeta.icon] ?? Icons.Box) : Icons.Box;

  if (previewMode) {
    return <DevicePreview />;
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Toolbox />
          <Canvas />
          <PropertiesPanel />
          <DragOverlay dropAnimation={null}>
            {activeMeta && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-indigo-400 rounded-lg shadow-xl text-sm text-indigo-700 font-medium pointer-events-none">
                <DragIcon size={14} />
                {activeMeta.label}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
