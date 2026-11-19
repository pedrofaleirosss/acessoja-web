import { useMemo, useState } from 'react';
import { MODULE_BY_KEY, getTitle } from '../data/modules.js';
import { Button, EmptyBlock, ErrorBlock, Icon, LoadingBlock, PageHeader, StatusPill } from './Ui.jsx';

const types = [
  { key: 'estabelecimentos', label: 'Estabelecimentos', icon: 'Store' },
  { key: 'areas-acessiveis', label: 'Áreas acessíveis', icon: 'Trees' },
  { key: 'barreiras', label: 'Barreiras', icon: 'Construction' },
];

export default function Explore({ type, setType, items, loading, error, bairros, cidades, onRefresh, onCreate, onDetail }) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [showPending, setShowPending] = useState(false);
  const module = MODULE_BY_KEY[type];
  const neighborhoods = Object.fromEntries((bairros || []).map((row) => [row.idBairro, row]));
  const cityIndex = Object.fromEntries((cidades || []).map((row) => [row.idCidade, row]));

  const filtered = useMemo(() => (items || []).filter((row) => {
    if (!showPending && row.statusModeracao !== 'APROVADO') return false;
    const bairro = neighborhoods[row.idBairro];
    const cidade = cityIndex[bairro?.idCidade];
    if (city && String(cidade?.idCidade) !== city) return false;
    const search = `${row.titulo || ''} ${row.categoria || ''} ${row.tipoArea || ''} ${row.tipoBarreira || ''} ${row.endereco || ''} ${row.descricao || ''} ${bairro?.nome || ''} ${cidade?.nome || ''}`.toLowerCase();
    return search.includes(query.toLowerCase().trim());
  }), [items, neighborhoods, cityIndex, showPending, city, query]);

  return <div className="animate-rise">
    <PageHeader eyebrow="Descubra sua cidade" title="Explorar acessibilidade" description="Encontre locais, espaços acessíveis e barreiras urbanas compartilhados pela comunidade." actions={<Button icon="Plus" onClick={() => onCreate(module)}>Adicionar {type === 'barreiras' ? 'barreira' : type === 'estabelecimentos' ? 'estabelecimento' : 'área'}</Button>}/>
    <div className="bg-white border border-[#e8eff2] rounded-[22px] shadow-soft p-4 sm:p-5 mb-6">
      <div className="flex flex-wrap gap-2 mb-5">{types.map((item) => <button key={item.key} onClick={() => { setType(item.key); setQuery(''); setCity(''); }} className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-bold transition-colors ${type === item.key ? 'bg-[#173a51] text-white shadow-sm' : 'bg-[#f3f7f8] text-[#6c8592] hover:bg-[#e8f2f2]'}`}><Icon name={item.icon} size={17}/>{item.label}</button>)}</div>
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_220px_auto] gap-3"><label className="relative"><Icon name="Search" className="absolute top-1/2 -translate-y-1/2 left-3.5 text-[#91a4ad]" size={18}/><input aria-label="Buscar locais" className="input-base pl-11 text-sm" placeholder="Pesquise por nome, endereço, categoria..." value={query} onChange={(e) => setQuery(e.target.value)}/></label><select aria-label="Filtrar por cidade" className="input-base text-sm" value={city} onChange={(e) => setCity(e.target.value)}><option value="">Todas as cidades</option>{(cidades || []).map((c) => <option key={c.idCidade} value={c.idCidade}>{c.nome} / {c.uf}</option>)}</select><Button variant="secondary" icon="RefreshCw" onClick={onRefresh}>Atualizar</Button></div>
      <div className="flex items-center justify-between flex-wrap gap-3 mt-4"><span className="text-xs text-[#879ca6]">{filtered.length} resultado(s)</span><label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[#718c99]"><input type="checkbox" checked={showPending} onChange={(e) => setShowPending(e.target.checked)} className="accent-[#13a79e] w-4 h-4" />Incluir registros não aprovados (demonstração)</label></div>
    </div>
    {loading && !items ? <LoadingBlock label="Buscando locais na API..."/> : error && !items ? <ErrorBlock error={error} onRetry={onRefresh}/> : filtered.length === 0 ? <div className="bg-white rounded-[22px] border border-[#e9eff2]"><EmptyBlock title="Nenhum local encontrado" description="Tente outro filtro ou cadastre uma contribuição para a comunidade." icon="MapPin" action={<Button variant="soft" icon="Plus" onClick={() => onCreate(module)}>Cadastrar</Button>}/></div> : <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">{filtered.map((item) => {
      const bairro = neighborhoods[item.idBairro]; const cidade = cityIndex[bairro?.idCidade];
      const isBarrier = type === 'barreiras';
      return <button key={item.idRegistro} onClick={() => onDetail(module, item)} className="text-left group bg-white rounded-[24px] border border-[#e8eff2] overflow-hidden card-hover shadow-soft flex flex-col">
        <div className={`h-36 sm:h-40 relative overflow-hidden ${isBarrier ? 'bg-gradient-to-br from-[#fbe7dd] via-[#fff1e4] to-[#f7e9df]' : type === 'estabelecimentos' ? 'bg-gradient-to-br from-[#d8f6ed] via-[#e8f7f3] to-[#edf4e8]' : 'bg-gradient-to-br from-[#d8f1e5] via-[#e3f8ef] to-[#dff4f2]'}`}>
          <div className="absolute h-40 w-40 rounded-full bg-white/35 -right-8 -top-16"/><div className="absolute h-32 w-32 rounded-full border-[25px] border-white/30 left-12 -bottom-12"/>
          <div className={`absolute inset-0 flex items-center justify-center ${isBarrier ? 'text-[#d88b68]' : 'text-[#38a59e]'}`}><Icon name={isBarrier ? 'Construction' : type === 'estabelecimentos' ? 'Store' : 'Trees'} size={63} strokeWidth={1.05}/></div>
          <span className="absolute left-4 top-4 rounded-full bg-white/85 backdrop-blur-sm text-[#476375] text-[10px] font-bold py-1.5 px-3">{isBarrier ? 'Barreira urbana' : type === 'estabelecimentos' ? item.categoria : item.tipoArea}</span>
        </div>
        <div className="px-5 pt-5 pb-4 flex-1"><div className="flex justify-between items-start gap-2 mb-3"><h3 className="font-display text-[16px] font-extrabold text-[#1d3c50] line-clamp-2 group-hover:text-[#0c9f97] transition-colors">{getTitle(module, item)}</h3><StatusPill status={isBarrier ? item.statusBarreira : item.statusModeracao} subtle/></div><p className="text-[12px] text-[#8c9fa8] flex items-center gap-1.5 mb-3"><Icon name="MapPin" size={14} className="shrink-0 text-[#22bcb3]"/><span className="truncate">{bairro?.nome ? `${bairro.nome} · ` : ''}{cidade?.nome ? `${cidade.nome} · ` : ''}{item.endereco}</span></p><p className="text-[#758d99] text-[12px] leading-relaxed line-clamp-2">{item.descricao || 'Sem descrição'}</p></div>
        <div className="border-t border-[#eef3f4] px-5 py-3.5 flex justify-between items-center"><span className="text-[11px] text-[#9dadb5]">Registro #{item.idRegistro}</span><span className="inline-flex items-center gap-1 font-extrabold text-[12px] text-[#0da69e]">Ver detalhes <Icon name="ArrowRight" size={15}/></span></div>
      </button>;
    })}</div>}
  </div>;
}
