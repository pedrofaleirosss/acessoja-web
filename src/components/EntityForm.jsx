import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Icon } from './Ui.jsx';
import { labelForRef } from '../data/modules.js';

const isMissing = (v) => v === null || v === undefined || String(v).trim() === '';

export default function EntityForm({ module, mode = 'create', record, prefill = {}, suggestedId, lookups = {}, busy, onCancel, onSubmit }) {
  const isCreate = mode === 'create';
  const fields = useMemo(() => module.fields.filter((f) => isCreate ? f.create !== false : f.edit !== false), [module, isCreate]);
  const [values, setValues] = useState(() => ({
    ...(isCreate && suggestedId !== undefined && !module.composite ? { [module.idField]: suggestedId } : {}),
    ...prefill,
    ...(record || {}),
    ...(mode === 'edit' && module.key === 'usuarios' ? { senha: '' } : {}),
  }));
  const [localError, setLocalError] = useState('');
  const idTouched = useRef(false);
  useEffect(() => {
    // Atualiza o ID sugerido quando o GET de registros termina, sem
    // sobrescrever um valor que a pessoa tenha digitado manualmente.
    if (isCreate && !module.composite && !idTouched.current && suggestedId !== undefined) {
      setValues((previous) => ({ ...previous, [module.idField]: suggestedId }));
    }
  }, [suggestedId, isCreate, module]);

  function submit(event) {
    event.preventDefault();
    setLocalError('');
    const payload = {};
    for (const field of fields) {
      const raw = values[field.key];
      const value = typeof raw === 'string' ? raw.trim() : raw;
      const optionalPassword = mode === 'edit' && field.key === 'senha';
      if (isMissing(value)) {
        if (field.required && !optionalPassword) {
          setLocalError(`Preencha o campo "${field.label}".`);
          return;
        }
        if (!optionalPassword) payload[field.key] = null;
        continue;
      }
      if (field.type === 'number') {
        const asNumber = Number(value);
        if (!Number.isSafeInteger(asNumber) || asNumber < (field.min ?? 1) || (field.max !== undefined && asNumber > field.max)) {
          setLocalError(`Informe um valor válido para "${field.label}".`);
          return;
        }
        payload[field.key] = asNumber;
      } else {
        if (field.maxLength && String(value).length > field.maxLength) {
          setLocalError(`O campo "${field.label}" permite até ${field.maxLength} caracteres.`);
          return;
        }
        if (field.minLength && String(value).length < field.minLength) {
          setLocalError(`O campo "${field.label}" precisa de pelo menos ${field.minLength} caracteres.`);
          return;
        }
        payload[field.key] = value;
      }
    }
    if (module.key === 'validacoes' && payload.tipoValidacao === 'CONTESTA' && !payload.comentario) {
      setLocalError('Informe o motivo da contestação.');
      return;
    }
    onSubmit(payload);
  }

  return <form onSubmit={submit} className="space-y-5">
    {module.warning && <div className="rounded-xl p-3.5 bg-amber-50 border border-amber-200 flex gap-2.5 text-amber-900 text-xs leading-relaxed"><Icon name="AlertCircle" size={18} className="shrink-0"/>{module.warning}</div>}
    {isCreate && !module.composite && <div className="rounded-xl p-3.5 bg-[#eaf7f5] border border-[#d8eeea] flex items-start gap-2.5 text-[#397971] text-xs leading-relaxed"><Icon name="Info" size={17} className="shrink-0 mt-0.5"/><span>O backend ainda utiliza <strong>identificadores manuais</strong>. Sugerimos um ID disponível, mas confira se ele não existe no Oracle antes de salvar.</span></div>}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((field) => {
        const lookup = field.ref ? lookups[field.ref] : null;
        const hasChoices = field.type === 'select' || (field.ref && Array.isArray(lookup) && lookup.length);
        const inputValue = values[field.key] ?? '';
        return <label key={field.key} className={`block ${field.type === 'textarea' || field.key === 'endereco' ? 'sm:col-span-2' : ''}`}>
          <span className="text-[#385369] text-xs font-bold mb-2 block">{!isCreate && field.updateLabel ? field.updateLabel : field.label}{(field.required && !(mode === 'edit' && field.key === 'senha')) && <span className="text-rose-500 ml-0.5">*</span>}</span>
          {field.type === 'textarea' ? <textarea rows={3} maxLength={field.maxLength} className="input-base resize-y min-h-24 text-sm" placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`} value={inputValue} onChange={(e) => { if (field.key === module.idField) idTouched.current = true; setValues((s) => ({ ...s, [field.key]: e.target.value })); }}/> :
            hasChoices ? <select className="input-base text-sm min-h-12" value={inputValue} onChange={(e) => { if (field.key === module.idField) idTouched.current = true; setValues((s) => ({ ...s, [field.key]: e.target.value })); }}>
              <option value="">Selecionar...</option>
              {field.type === 'select' ? field.options.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>) :
                lookup.map((row) => {
                  const id = row.idRegistro ?? row.idCidade ?? row.idBairro ?? row.idUsuario ?? row.idRecurso;
                  return <option key={id} value={id}>{labelForRef(field.ref, row)}</option>;
                })}
            </select> :
            <input className="input-base min-h-12 text-sm" type={field.type === 'number' ? 'number' : field.type || 'text'} min={field.type === 'number' ? field.min ?? 1 : undefined} max={field.type === 'number' ? field.max : undefined} maxLength={field.maxLength} autoComplete={field.type === 'password' ? 'new-password' : 'off'} placeholder={field.placeholder || (field.type === 'number' ? 'Informe o ID' : 'Digite aqui')} value={inputValue} onChange={(e) => { if (field.key === module.idField) idTouched.current = true; setValues((s) => ({ ...s, [field.key]: e.target.value })); }}/>
          }
          {field.help && <span className="small-muted block mt-1.5">{field.help}</span>}
          {field.ref && !hasChoices && <span className="small-muted block mt-1.5">Informe um ID que já exista na tabela relacionada.</span>}
        </label>;
      })}
    </div>
    {localError && <div role="alert" className="text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 flex items-center gap-2"><Icon name="AlertCircle" size={17}/>{localError}</div>}
    <div className="pt-3 border-t border-[#edf3f5] flex items-center justify-end gap-2.5">
      <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
      <Button type="submit" icon={isCreate ? 'Plus' : 'Check'} loading={busy} disabled={busy}>{isCreate ? `Cadastrar ${module.singular.toLowerCase()}` : 'Salvar alterações'}</Button>
    </div>
  </form>;
}
