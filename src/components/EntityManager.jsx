import { useMemo, useState } from 'react';
import { MODULES, displayValue, getFieldLabel, getTitle, looksLikeStatus } from '../data/modules.js';
import { Button, EmptyBlock, ErrorBlock, Icon, LoadingBlock, PageHeader, StatusPill } from './Ui.jsx';

const PAGE_SIZE = 8;
const groups = [
  { title: 'Base e localização', keys: MODULES.filter((m) => m.category === 'base') },
  { title: 'Acessibilidade', keys: MODULES.filter((m) => m.category === 'locais') },
  { title: 'Recursos', keys: MODULES.filter((m) => m.category === 'recursos') },
  { title: 'Comunidade', keys: MODULES.filter((m) => m.category === 'comunidade') },
];

export default function EntityManager({ activeKey, onModuleChange, items, loading, error, onRefresh, onCreate, onEdit, onDetail, onDelete, onAnalyze, query, setQuery }) {
  const [page, setPage] = useState(1);
  const module = MODULES.find((m) => m.key === activeKey) || MODULES[0];
  const filtered = useMemo(() => (items || []).filter((row) => Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(query.trim().toLowerCase()))), [items, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((Math.min(page, totalPages) - 1) * PAGE_SIZE, Math.min(page, totalPages) * PAGE_SIZE);

  const chooseModule = (key) => { setPage(1); setQuery(''); onModuleChange(key); };
  return <section className="animate-rise">
    <PageHeader eyebrow="Painel de demonstração" title="Gerenciar dados" description="Todos os 12 módulos da API em um só lugar. Consulte, cadastre, edite e exclua informações reais do Oracle." actions={<Button icon="Plus" onClick={() => onCreate(module)}>Novo registro</Button>}/>
    <div className="grid grid-cols-1 xl:grid-cols-[245px_minmax(0,1fr)] gap-5">
      <aside className="bg-white border border-[#e8eff2] rounded-[22px] shadow-soft p-3 xl:self-start">
        <p className="text-xs text-[#7c909d] font-bold uppercase tracking-[.14em] px-3 py-2">Entidades da API</p>
        {groups.map((group) => <div key={group.title} className="mb-3 last:mb-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#a4b2ba] px-3 pt-3 pb-1">{group.title}</div>
          <div className="space-y-0.5">{group.keys.map((item) => <button key={item.key} onClick={() => chooseModule(item.key)} className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-colors ${activeKey === item.key ? 'bg-[#e5f7f5] text-[#098f87] font-extrabold' : 'text-[#536e7e] hover:bg-[#f5f9fa] font-semibold'}`}><Icon name={item.icon} size={16}/><span className="flex-1">{item.title}</span>{activeKey === item.key && <Icon name="ChevronRight" size={14}/>}</button>)}</div>
        </div>)}
      </aside>
      <div className="min-w-0 space-y-4">
        <div className="bg-white rounded-[22px] border border-[#e8eff2] p-5 sm:p-6 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3.5"><span className="h-12 w-12 bg-[#e5f7f5] rounded-2xl flex items-center justify-center text-[#0d9e96]"><Icon name={module.icon} size={23}/></span><div><h2 className="font-display text-lg font-extrabold text-[#1a394d]">{module.title}</h2><p className="text-xs text-[#90a0a9] mt-0.5">Endpoint: <code>{module.path}</code></p></div></div><span className="px-3 py-1.5 rounded-full bg-[#f2f6f8] text-xs text-[#577080] font-bold">{items?.length ?? 0} registros</span></div>
          {module.warning && <div className="bg-amber-50 text-amber-800 text-xs mt-4 p-3 rounded-xl border border-amber-100">{module.warning}</div>}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mt-5"><label className="relative flex-1"><Icon name="Search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9bacb4]" size={18}/><input aria-label="Pesquisar dados da entidade" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Pesquisar em qualquer campo..." className="input-base pl-11 text-sm" /></label><Button variant="secondary" icon="RefreshCw" onClick={onRefresh}>Atualizar</Button></div>
        </div>
        <div className="bg-white border border-[#e8eff2] rounded-[22px] shadow-soft overflow-hidden">
          {loading && !items ? <LoadingBlock/> : error && !items ? <div className="p-4"><ErrorBlock error={error} onRetry={onRefresh}/></div> : filtered.length === 0 ? <EmptyBlock title={items?.length ? 'Nenhum resultado para a pesquisa' : 'Ainda não há registros'} description="Limpe os filtros ou cadastre um novo item." action={<Button variant="soft" icon="Plus" onClick={() => onCreate(module)}>Novo registro</Button>}/> : <>
            <div className="overflow-x-auto sheet-scroll hidden md:block"><table className="w-full text-left min-w-[740px]"><thead><tr className="bg-[#f8fbfc] border-b border-[#ecf1f3]">{module.columns.map((field) => <th key={field} className="px-5 py-4 text-[11px] uppercase tracking-[.08em] text-[#90a0ab] font-extrabold">{getFieldLabel(module, field)}</th>)}<th className="px-5 py-4 text-[11px] text-right text-[#90a0ab] font-extrabold uppercase">Ações</th></tr></thead><tbody>{visible.map((row) => <tr key={module.composite ? `${row.idEstabelecimento}-${row.idRecurso}` : row[module.idField]} className="border-b border-[#f0f4f6] last:border-none hover:bg-[#fbfdfd]">{module.columns.map((field) => <td key={field} className="px-5 py-4 text-xs max-w-[220px] truncate text-[#436174]" title={displayValue(row[field])}>{looksLikeStatus(field) ? <StatusPill status={row[field]} subtle/> : field === 'nota' ? <span className="text-amber-600 font-bold">★ {row[field] ?? '—'}</span> : field === 'titulo' || field === 'nome' ? <span className="font-bold text-[#1d3a50]">{displayValue(row[field])}</span> : displayValue(row[field])}</td>)}<td className="px-5 py-3"><div className="flex gap-1 justify-end"><MiniAction name="Eye" label="Ver detalhes" onClick={() => onDetail(module, row)} /><MiniAction name="Pencil" label="Editar" onClick={() => onEdit(module, row)}/>{module.key === 'relatos-resolucao' && row.statusAnalise === 'PENDENTE' && <MiniAction name="ShieldCheck" label="Analisar relato" onClick={() => onAnalyze(row)}/>}<MiniAction name="Trash2" label="Excluir" danger onClick={() => onDelete(module, row)}/></div></td></tr>)}</tbody></table></div>
            <div className="md:hidden divide-y divide-[#eef3f5]">{visible.map((row) => <div key={module.composite ? `${row.idEstabelecimento}-${row.idRecurso}` : row[module.idField]} className="p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="font-bold text-sm text-[#193c52] line-clamp-2">{getTitle(module, row)}</p><p className="text-xs text-[#91a0a9] mt-1">ID: {module.composite ? `${row.idEstabelecimento} / ${row.idRecurso}` : row[module.idField]}</p></div>{(row.statusModeracao || row.statusAnalise || row.statusBarreira) && <StatusPill status={row.statusAnalise || row.statusBarreira || row.statusModeracao} subtle/>}</div><div className="grid grid-cols-2 gap-2 text-[11px] mt-3">{module.columns.slice(1, 5).map((field) => <p key={field}><span className="block text-[#9aabb4]">{getFieldLabel(module, field)}</span><span className="block truncate text-[#526e7c] font-semibold">{displayValue(row[field])}</span></p>)}</div><div className="flex gap-2 mt-4 flex-wrap"><Button variant="secondary" size="sm" icon="Eye" onClick={() => onDetail(module, row)}>Ver</Button><Button variant="secondary" size="sm" icon="Pencil" onClick={() => onEdit(module, row)}>Editar</Button>{module.key === 'relatos-resolucao' && row.statusAnalise === 'PENDENTE' && <Button variant="soft" size="sm" onClick={() => onAnalyze(row)}>Analisar</Button>}<Button variant="ghost" size="sm" icon="Trash2" className="text-rose-600" onClick={() => onDelete(module, row)}>Excluir</Button></div></div>)}</div>
            <div className="border-t border-[#eef3f5] p-4 flex items-center justify-between gap-3"><span className="text-xs text-[#8399a5]">{filtered.length} resultado(s) · Página {Math.min(page, totalPages)} de {totalPages}</span><div className="flex gap-2"><button className="h-9 w-9 rounded-xl border border-[#e3ecf0] flex items-center justify-center text-[#446679] disabled:opacity-35" disabled={page <= 1} aria-label="Página anterior" onClick={() => setPage((p) => Math.max(1, p - 1))}><Icon name="ChevronLeft" size={17}/></button><button className="h-9 w-9 rounded-xl border border-[#e3ecf0] flex items-center justify-center text-[#446679] disabled:opacity-35" disabled={page >= totalPages} aria-label="Próxima página" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}><Icon name="ChevronRight" size={17}/></button></div></div>
          </>}
        </div>
      </div>
    </div>
  </section>;
}

function MiniAction({ name, label, onClick, danger = false }) { return <button type="button" aria-label={label} title={label} onClick={onClick} className={`h-8 w-8 inline-flex items-center justify-center rounded-lg transition-colors ${danger ? 'text-rose-500 hover:bg-rose-50' : 'text-[#698594] hover:bg-[#eaf6f6] hover:text-[#0d9d95]'}`}><Icon name={name} size={16}/></button>; }
