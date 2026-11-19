import { MODULE_BY_KEY, getTitle } from '../data/modules.js';
import { Button, ErrorBlock, Icon, LoadingBlock, PageHeader, StatusPill } from './Ui.jsx';

const FEATURES = [
  { key: 'estabelecimentos', name: 'Estabelecimentos', icon: 'Store', tint: 'bg-[#e5f8f5] text-[#0a9e93]', desc: 'Locais e serviços cadastrados' },
  { key: 'areas-acessiveis', name: 'Áreas acessíveis', icon: 'Trees', tint: 'bg-[#e9f2ff] text-[#5285c6]', desc: 'Espaços públicos inclusivos' },
  { key: 'barreiras', name: 'Barreiras urbanas', icon: 'Construction', tint: 'bg-[#fff0e6] text-[#db8553]', desc: 'Obstáculos reportados' },
  { key: 'cidades', name: 'Cidades', icon: 'MapPin', tint: 'bg-[#f0edff] text-[#8870c4]', desc: 'Municípios cadastrados' },
];

function Stat({ item, value, onClick }) {
  return <button onClick={onClick} className="text-left bg-white rounded-[22px] border border-[#e9f0f2] p-5 shadow-soft card-hover">
    <div className="flex items-start justify-between gap-3"><span className={`rounded-2xl w-12 h-12 flex items-center justify-center ${item.tint}`}><Icon name={item.icon} size={22}/></span><span className="text-[#bad0d8]"><Icon name="ArrowUpRight" size={18}/></span></div>
    <p className="font-display mt-5 text-[32px] tracking-[-.04em] font-extrabold leading-none text-[#18374e]">{value ?? '—'}</p><p className="mt-2 font-bold text-[13px] text-[#29485b]">{item.name}</p><p className="mt-1 text-[11px] text-[#95a7b1]">{item.desc}</p>
  </button>;
}

export default function Dashboard({ data, loading, errors, onNavigate, onCreate, onRefresh }) {
  const barrierData = data.barreiras || [];
  const estabData = data.estabelecimentos || [];
  const areaData = data['areas-acessiveis'] || [];
  const all = [...barrierData.map((record) => ({ ...record, source: 'barreiras' })), ...estabData.map((record) => ({ ...record, source: 'estabelecimentos' })), ...areaData.map((record) => ({ ...record, source: 'areas-acessiveis' }))];
  const recent = all.sort((a,b) => (b.dataCadastro || '').localeCompare(a.dataCadastro || '') || (b.idRegistro || 0) - (a.idRegistro || 0)).slice(0, 5);
  const allUnavailable = FEATURES.every(({ key }) => !data[key]);
  const anyError = FEATURES.some(({ key }) => errors[key]);
  const published = all.filter((r) => r.statusModeracao === 'APROVADO').length;
  const pending = all.filter((r) => r.statusModeracao === 'PENDENTE').length;

  return <div className="animate-rise">
    <PageHeader eyebrow="Seu espaço de acessibilidade" title="Visão geral" description="Uma visão simples das informações colaborativas cadastradas no AcessoJá." actions={<Button variant="secondary" icon="RefreshCw" onClick={onRefresh}>Atualizar dados</Button>}/>
    <div className="relative overflow-hidden bg-[#17374f] rounded-[28px] p-6 sm:p-8 lg:p-10 text-white mb-6 min-h-[240px] shadow-[0_19px_42px_rgba(19,57,78,.14)]">
      <div aria-hidden="true" className="absolute -top-32 -right-24 w-[360px] h-[360px] rounded-full border-[70px] border-[#2fc8ba]/15"/>
      <div aria-hidden="true" className="absolute -bottom-28 right-[18%] w-[260px] h-[260px] rounded-full bg-[#1a8d91]/16 blur-2xl"/>
      <div className="relative z-10 max-w-[510px]"><div className="inline-flex items-center gap-2 rounded-full bg-[#2eb3af]/16 border border-[#42cbbd]/20 px-3 py-1.5 text-[11px] font-bold text-[#a7eee6] mb-5"><Icon name="Sparkles" size={13}/> Uma cidade melhor começa com informação</div><h2 className="font-display font-extrabold leading-[1.17] tracking-[-.04em] text-[27px] sm:text-4xl">Acessibilidade para todos.<br/><span className="text-[#3ed1c5]">Informação para cada passo.</span></h2><p className="mt-4 text-[13px] sm:text-sm leading-relaxed text-[#b4ceda] max-w-[450px]">Explore estabelecimentos, espaços acessíveis e barreiras urbanas reportados pela comunidade.</p><div className="flex flex-wrap gap-2.5 mt-6"><Button onClick={() => onNavigate('explorar')} icon="Compass" className="!bg-[#27bdb4]">Explorar locais</Button><Button variant="secondary" onClick={() => onCreate(MODULE_BY_KEY.barreiras)} icon="Plus" className="!bg-white/10 !text-white !border-white/15 hover:!bg-white/20">Reportar barreira</Button></div></div>
      <div className="hidden lg:flex absolute right-12 top-[52px] h-44 w-44 items-center justify-center rounded-full border border-white/12 bg-white/5"><div className="h-32 w-32 rounded-full bg-[#2bd5c7]/12 flex items-center justify-center border border-[#48cfca]/20"><Icon name="HeartHandshake" size={58} strokeWidth={1.15} className="text-[#53d3c7]"/></div></div>
    </div>
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">{FEATURES.map((feature) => <Stat key={feature.key} item={feature} value={data[feature.key]?.length} onClick={() => feature.key === 'cidades' ? onNavigate('gerenciar', 'cidades') : onNavigate('explorar', feature.key)}/>)}</div>
    {anyError && <div className="mb-6"><ErrorBlock error={Object.values(errors).find(Boolean)} onRetry={onRefresh}/></div>}
    {allUnavailable && loading ? <LoadingBlock label="Consultando dados da API no Render..."/> : <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] gap-5">
      <div className="bg-white border border-[#e8eff2] shadow-soft rounded-[22px] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-5"><div><h3 className="font-display font-extrabold text-base text-[#1b394e]">Contribuições recentes</h3><p className="text-xs text-[#91a3ac] mt-1">Últimos registros cadastrados</p></div><button onClick={() => onNavigate('gerenciar','registros')} className="text-xs font-bold text-[#0c9d95] flex items-center gap-1">Ver todos <Icon name="ArrowRight" size={15}/></button></div>
        {recent.length ? <div className="space-y-1">{recent.map((item) => <div key={`${item.source}-${item.idRegistro}`} className="flex items-center gap-3 py-3 border-b last:border-0 border-[#f0f4f5]"><div className={`rounded-xl w-10 h-10 flex justify-center items-center shrink-0 ${item.source === 'barreiras' ? 'bg-[#fff0e6] text-[#e58a5a]' : 'bg-[#e6f8f5] text-[#1ba49b]'}`}><Icon name={item.source === 'barreiras' ? 'Construction' : item.source === 'estabelecimentos' ? 'Store' : 'Trees'} size={18}/></div><div className="min-w-0 flex-1"><p className="font-semibold text-[13px] text-[#2a475b] truncate">{getTitle(MODULE_BY_KEY[item.source], item)}</p><p className="text-[11px] text-[#a0adb6] mt-0.5 truncate">{item.endereco || 'Localização não informada'}</p></div><StatusPill status={item.statusModeracao} subtle/></div>)}</div> : <p className="text-sm text-[#94a4ad] py-10 text-center">Ainda não há contribuições disponíveis.</p>}
      </div>
      <div className="space-y-5">
        <div className="bg-white border border-[#e8eff2] shadow-soft rounded-[22px] p-5 sm:p-6"><h3 className="font-display font-extrabold text-base text-[#1b394e]">Panorama da comunidade</h3><p className="text-xs text-[#91a3ac] mt-1 mb-5">Situação dos registros carregados</p><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#e9f8f5] p-4"><p className="text-[#0c9c92] font-display text-[29px] font-extrabold">{published}</p><p className="text-xs text-[#40867f] font-semibold mt-1">Aprovados</p></div><div className="rounded-2xl bg-[#fff7e9] p-4"><p className="text-[#d99433] font-display text-[29px] font-extrabold">{pending}</p><p className="text-xs text-[#a6885b] font-semibold mt-1">Pendentes</p></div></div><p className="text-[11px] text-[#9aabb5] mt-4">Somente registros aprovados aparecem na exploração pública, por padrão.</p></div>
        <div className="rounded-[22px] bg-gradient-to-br from-[#daf6f1] via-[#effaf8] to-white border border-[#d8eee9] p-5 sm:p-6"><span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white/70 text-[#0b9c93]"><Icon name="HeartHandshake" size={21}/></span><h3 className="font-display text-base font-extrabold text-[#1b4751] mt-3">Faça parte da mudança</h3><p className="text-xs text-[#65858c] mt-2 leading-relaxed">Uma informação compartilhada pode melhorar a mobilidade de alguém.</p><button className="text-xs text-[#0a978e] font-extrabold mt-4 inline-flex items-center gap-1" onClick={() => onNavigate('contribuir')}>Quero contribuir <Icon name="ArrowRight" size={15}/></button></div>
      </div>
    </div>}
  </div>;
}
