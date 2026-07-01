import { useDesignerStore } from '../../../store/designerStore';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { ElementWrapper } from './ElementWrapper';
import { ControlPreview } from './ControlPreview';
import { cn } from '../../../utils/cn';
import { Plus, Trash2 } from 'lucide-react';

function PageDropZone({ pageId, elements }: { pageId: string; elements: any[] }) {
  const { isOver, setNodeRef } = useDroppable({ id: `page-${pageId}` });
  const { selectElement, clearSelection } = useDesignerStore();
  return (
    <div
      ref={setNodeRef}
      onClick={() => clearSelection()}
      className={cn(
        'min-h-[200px] flex-1 transition-colors rounded-lg',
        isOver && 'bg-indigo-50/50'
      )}
    >
      <SortableContext items={elements.map(e => e.id)} strategy={verticalListSortingStrategy}>
        {elements.length === 0 ? (
          <div className={cn(
            'min-h-[200px] flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl',
            isOver ? 'border-indigo-400 text-indigo-500' : 'border-gray-200 text-gray-400'
          )}>
            <div className="text-3xl">📋</div>
            <p className="text-sm font-medium">Drag fields here to build your form</p>
            <p className="text-xs">Or click a field in the toolbox</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pl-6">
            {elements.map(el => (
              <ElementWrapper key={el.id} element={el}>
                <ControlPreview element={el} />
              </ElementWrapper>
            ))}
          </div>
        )}
      </SortableContext>
    </div>
  );
}

export function Canvas() {
  const { schema, activePageIndex, setActivePageIndex, addPage, removePage, updatePage, canvasWidth } = useDesignerStore();
  const pages = schema.pages;
  const activePage = pages[activePageIndex];

  return (
    <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-slate-100" dir={schema.direction}>
      {/* Page tabs */}
      {pages.length > 1 && (
        <div className="flex items-center gap-1 px-4 pt-3 shrink-0">
          {pages.map((page, i) => (
            <div key={page.id} className="flex items-center">
              <button
                onClick={() => setActivePageIndex(i)}
                className={cn(
                  'px-3 py-1.5 rounded-t text-sm font-medium transition-colors',
                  i === activePageIndex
                    ? 'bg-white text-indigo-700 border-t border-l border-r border-gray-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                )}
              >
                {page.title}
              </button>
              {pages.length > 1 && (
                <button
                  onClick={() => removePage(page.id)}
                  className="ml-0.5 p-0.5 text-gray-300 hover:text-red-400"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addPage}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-indigo-600 hover:bg-white rounded"
          >
            <Plus size={12} /> Add Page
          </button>
        </div>
      )}

      {/* Canvas area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px] flex flex-col gap-4 transition-all duration-200"
          style={{ width: canvasWidth, maxWidth: '100%' }}>
          {/* Page header */}
          <div className="pb-2 border-b border-gray-100">
            <input
              className="text-lg font-semibold text-gray-800 bg-transparent outline-none w-full"
              value={activePage?.title ?? ''}
              onChange={e => activePage && updatePage(activePage.id, { title: e.target.value })}
              placeholder="Page title"
            />
          </div>

          {activePage && (
            <PageDropZone pageId={activePage.id} elements={activePage.elements} />
          )}
        </div>

        {/* Add page at bottom */}
        {pages.length <= 1 && (
          <div className="mx-auto mt-3 text-center" style={{ width: canvasWidth, maxWidth: '100%' }}>
            <button
              onClick={addPage}
              className="flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-indigo-600"
        
            >
              <Plus size={14} />
              Add Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
