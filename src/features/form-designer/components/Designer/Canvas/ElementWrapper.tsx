import { useDesignerStore } from '../../../store/designerStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../utils/cn';
import { Trash2, Copy, GripVertical } from 'lucide-react';
import type { FormElement } from '../../../types/schema';

interface Props {
  element: FormElement;
  children: React.ReactNode;
}

export function ElementWrapper({ element, children }: Props) {
  const { selectedIds, selectElement, removeElement, duplicateElement } = useDesignerStore();
  const isSelected = selectedIds.includes(element.id);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: element.id,
    data: { elementId: element.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    width: (element as any).style?.width ?? '100%',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={e => { e.stopPropagation(); selectElement(element.id, e.ctrlKey || e.metaKey || e.shiftKey); }}
      className={cn(
        'relative group rounded-md',
        isSelected && 'ring-2 ring-indigo-500',
        !isSelected && 'hover:ring-1 hover:ring-indigo-300',
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab text-gray-400 hover:text-gray-600 z-10"
      >
        <GripVertical size={14} />
      </div>

      {children}

      {/* Controls (show on selected) */}
      {isSelected && (
        <div className="absolute -top-3 right-0 flex items-center gap-1 z-20">
          <button
            onClick={e => { e.stopPropagation(); duplicateElement(element.id); }}
            className="p-1 bg-white border border-gray-200 rounded shadow-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-300"
          >
            <Copy size={11} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); removeElement(element.id); }}
            className="p-1 bg-white border border-gray-200 rounded shadow-sm text-gray-500 hover:text-red-600 hover:border-red-300"
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}
    </div>
  );
}
