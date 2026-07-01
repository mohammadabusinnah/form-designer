import { useState } from 'react';
import type { LogicRule, ConditionGroup, Condition, LogicAction, ConditionOperator, ActionType } from '../../types/schema';
import { genId } from '../../utils/idGenerator';
import { X, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Props {
  rule?: LogicRule;
  fieldOptions: Array<{ value: string; label: string }>;
  onSave: (rule: LogicRule) => void;
  onClose: () => void;
}

const OPERATORS: Array<{ value: ConditionOperator; label: string }> = [
  { value: 'equals', label: 'equals' },
  { value: 'notEquals', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'notContains', label: 'not contains' },
  { value: 'startsWith', label: 'starts with' },
  { value: 'endsWith', label: 'ends with' },
  { value: 'greaterThan', label: 'greater than' },
  { value: 'lessThan', label: 'less than' },
  { value: 'isEmpty', label: 'is empty' },
  { value: 'isNotEmpty', label: 'is not empty' },
  { value: 'in', label: 'in list' },
  { value: 'notIn', label: 'not in list' },
  { value: 'checked', label: 'is checked' },
  { value: 'unchecked', label: 'is unchecked' },
];

const ACTIONS: Array<{ value: ActionType; label: string; hasTarget: boolean; hasValue: boolean }> = [
  { value: 'show', label: 'Show', hasTarget: true, hasValue: false },
  { value: 'hide', label: 'Hide', hasTarget: true, hasValue: false },
  { value: 'enable', label: 'Enable', hasTarget: true, hasValue: false },
  { value: 'disable', label: 'Disable', hasTarget: true, hasValue: false },
  { value: 'require', label: 'Require', hasTarget: true, hasValue: false },
  { value: 'unrequire', label: 'Unrequire', hasTarget: true, hasValue: false },
  { value: 'setValue', label: 'Set Value', hasTarget: true, hasValue: true },
  { value: 'clearValue', label: 'Clear Value', hasTarget: true, hasValue: false },
  { value: 'jumpToPage', label: 'Jump to Page', hasTarget: true, hasValue: false },
  { value: 'addError', label: 'Add Error', hasTarget: true, hasValue: true },
];

const noValueOps: ConditionOperator[] = ['isEmpty', 'isNotEmpty', 'checked', 'unchecked'];

export function LogicBuilder({ rule, fieldOptions, onSave, onClose }: Props) {
  const [name, setName] = useState(rule?.name ?? 'New Rule');
  const [condOp, setCondOp] = useState<'AND' | 'OR'>(rule?.conditions.operator ?? 'AND');
  const [conditions, setConditions] = useState<Condition[]>(rule?.conditions.rules ?? [
    { id: genId('cond'), field: fieldOptions[0]?.value ?? '', operator: 'equals', value: '' }
  ]);
  const [actions, setActions] = useState<LogicAction[]>(rule?.actions ?? [
    { id: genId('act'), type: 'show', target: fieldOptions[0]?.value ?? '' }
  ]);

  const addCond = () => setConditions(c => [...c, { id: genId('cond'), field: fieldOptions[0]?.value ?? '', operator: 'equals', value: '' }]);
  const removeCond = (id: string) => setConditions(c => c.filter(x => x.id !== id));
  const updateCond = (id: string, patch: Partial<Condition>) => setConditions(c => c.map(x => x.id === id ? { ...x, ...patch } : x));

  const addAction = () => setActions(a => [...a, { id: genId('act'), type: 'show', target: fieldOptions[0]?.value ?? '' }]);
  const removeAction = (id: string) => setActions(a => a.filter(x => x.id !== id));
  const updateAction = (id: string, patch: Partial<LogicAction>) => setActions(a => a.map(x => x.id === id ? { ...x, ...patch } : x));

  const save = () => {
    onSave({
      id: rule?.id ?? genId('rule'),
      name,
      conditions: { operator: condOp, rules: conditions },
      actions,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Logic Rule</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Rule name */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Rule Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input-base" />
          </div>

          {/* Conditions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700">IF</span>
              <select value={condOp} onChange={e => setCondOp(e.target.value as any)} className="border border-gray-200 rounded px-2 py-1 text-xs">
                <option value="AND">All (AND)</option>
                <option value="OR">Any (OR)</option>
              </select>
              <span className="text-sm text-gray-500">of the following conditions are met:</span>
            </div>
            <div className="space-y-2">
              {conditions.map(cond => (
                <div key={cond.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                  <select value={cond.field} onChange={e => updateCond(cond.id, { field: e.target.value })} className="input-base flex-1 text-xs">
                    {fieldOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <select value={cond.operator} onChange={e => updateCond(cond.id, { operator: e.target.value as any })} className="input-base w-32 text-xs">
                    {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {!noValueOps.includes(cond.operator) && (
                    <input value={String(cond.value ?? '')} onChange={e => updateCond(cond.id, { value: e.target.value })} className="input-base w-24 text-xs" placeholder="value" />
                  )}
                  <button onClick={() => removeCond(cond.id)} className="text-gray-300 hover:text-red-400 shrink-0"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
            <button onClick={addCond} className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
              <Plus size={12} /> Add Condition
            </button>
          </div>

          {/* Actions */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">THEN perform these actions:</p>
            <div className="space-y-2">
              {actions.map(act => {
                const meta = ACTIONS.find(a => a.value === act.type);
                return (
                  <div key={act.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                    <select value={act.type} onChange={e => updateAction(act.id, { type: e.target.value as any })} className="input-base w-32 text-xs">
                      {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                    {meta?.hasTarget && (
                      <select value={act.target} onChange={e => updateAction(act.id, { target: e.target.value })} className="input-base flex-1 text-xs">
                        {fieldOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    )}
                    {meta?.hasValue && (
                      <input value={String(act.value ?? '')} onChange={e => updateAction(act.id, { value: e.target.value })} className="input-base w-24 text-xs" placeholder="value" />
                    )}
                    <button onClick={() => removeAction(act.id)} className="text-gray-300 hover:text-red-400 shrink-0"><Trash2 size={13} /></button>
                  </div>
                );
              })}
            </div>
            <button onClick={addAction} className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
              <Plus size={12} /> Add Action
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
          <button onClick={save} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Save Rule</button>
        </div>
      </div>
    </div>
  );
}
