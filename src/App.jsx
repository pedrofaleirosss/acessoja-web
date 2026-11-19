import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiRequest, BACKEND_URL, endpoint, listRows } from './lib/api.js';
import { displayValue, getFieldLabel, getTitle, looksLikeStatus, MODULES, MODULE_BY_KEY } from './data/modules.js';
import { Brand, Button, Dialog, Icon, PageHeader, StatusPill, Toast } from './components/Ui.jsx';
import EntityForm from './components/EntityForm.jsx';
import Dashboard from './components/Dashboard.jsx';
import Explore from './components/Explore.jsx';
import Contribute from './components/Contribute.jsx';
import EntityManager from './components/EntityManager.jsx';

const NAV = [
  { key: 'dashboard', label: 'Visão geral', icon: 'LayoutDashboard' },
  { key: 'explorar', label: 'Explorar locais', icon: 'Compass' },
  { key: 'contribuir', label: 'Contribuir', icon: 'HeartHandshake' },
  { key: 'gerenciar', label: 'Gerenciar dados', icon: 'Database' },
  { key: 'sobre', label: 'Sobre o projeto', icon: 'Info' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [activeModule, setActiveModule] = useState('cidades');
  const [exploreType, setExploreType] = useState('estabelecimentos');
  const [managerQuery, setManagerQuery] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [analyzeValues, setAnalyzeValues] = useState({ idAdminRevisor: 1, statusAnalise: 'APROVADO' });
  const cacheRef = useRef({});
  const inflightRef = useRef({});
  const toastTimer = useRef(null);

  const notify = useCallback((message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 6500);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const load = useCallback((key, force = false) => {
    if (!MODULE_BY_KEY[key]) return Promise.resolve([]);
    if (!force && cacheRef.current[key]) return Promise.resolve(cacheRef.current[key]);
    if (inflightRef.current[key]) return inflightRef.current[key];
    setLoading((previous) => ({ ...previous, [key]: true }));
    setErrors((previous) => ({ ...previous, [key]: null }));
    const promise = listRows(MODULE_BY_KEY[key])
      .then((result) => {
        cacheRef.current[key] = result;
        setCache((previous) => ({ ...previous, [key]: result }));
        return result;
      })
      .catch((error) => {
        setErrors((previous) => ({ ...previous, [key]: error }));
        throw error;
      })
      .finally(() => {
        delete inflightRef.current[key];
        setLoading((previous) => ({ ...previous, [key]: false }));
      });
    inflightRef.current[key] = promise;
    return promise;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const keys = page === 'dashboard' ? ['estabelecimentos', 'areas-acessiveis', 'barreiras', 'cidades']
      : page === 'explorar' ? [exploreType, 'bairros', 'cidades']
      : page === 'gerenciar' ? [activeModule] : [];
    (async () => {
      for (const key of [...new Set(keys)]) {
        if (cancelled) break;
        try { await load(key); } catch { /* Os erros são exibidos na própria tela. */ }
      }
    })();
    return () => { cancelled = true; };
  }, [page, exploreType, activeModule, load]);

  const navigate = (targetPage, key) => {
    setPage(targetPage);
    if (targetPage === 'explorar' && key && ['estabelecimentos', 'areas-acessiveis', 'barreiras'].includes(key)) setExploreType(key);
    if (targetPage === 'gerenciar' && key && MODULE_BY_KEY[key]) setActiveModule(key);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshView = () => {
    const keys = page === 'dashboard' ? ['estabelecimentos', 'areas-acessiveis', 'barreiras', 'cidades'] : page === 'explorar' ? [exploreType, 'bairros', 'cidades'] : [activeModule];
    (async () => { for (const key of [...new Set(keys)]) await load(key, true).catch(() => {}); })();
  };

  const openForm = (module, prefill = {}, record = null) => {
    setDialog({ type: 'form', module, mode: record ? 'edit' : 'create', record, prefill });
    const extraKeys = [...new Set([...module.fields.filter((f) => f.ref).map((f) => f.ref), module.idSource || module.key])];
    // Carrega em sequência para não sobrecarregar o limite de sessões Oracle.
    (async () => { for (const key of extraKeys) { try { await load(key); } catch { /* Campo pode receber o ID manualmente. */ } } })();
  };
  const openDetail = (module, record) => {
    setDialog({ type: 'detail', module, record });
    // GET por ID real: demonstra também a rota individual da API.
    const path = endpoint(module, record);
    apiRequest(path)
      .then((detail) => {
        if (!detail || typeof detail !== 'object') return;
        setDialog((current) => current?.type === 'detail' && current.module.key === module.key && endpoint(current.module, current.record) === path
          ? { ...current, record: detail }
          : current);
      })
      .catch((error) => notify(`Detalhe remoto indisponível: ${error.message}`, 'error'));
  };
  const openDelete = (module, record) => setDialog({ type: 'delete', module, record });
  const openAnalyze = (record) => { setAnalyzeValues({ idAdminRevisor: 1, statusAnalise: 'APROVADO' }); setDialog({ type: 'analyze', module: MODULE_BY_KEY['relatos-resolucao'], record }); load('usuarios').catch(() => {}); };

  const suggestedId = (module) => {
    if (!module || module.composite) return undefined;
    const rows = cache[module.idSource || module.key];
    return rows?.length ? Math.max(0, ...rows.map((r) => Number(r[module.idField]) || 0)) + 1 : 1001;
  };

  const afterMutation = async (module) => {
    setDialog(null);
    // Recarrega a entidade afetada e o registro geral, se for especialização.
    const affected = [module.key, ...(module.idSource ? ['registros'] : [])];
    for (const key of affected) await load(key, true).catch(() => {});
  };

  const saveRecord = async (payload) => {
    if (!dialog || busy) return;
    const current = dialog;
    setBusy(true);
    try {
      const isEdit = current.mode === 'edit';
      const path = isEdit ? endpoint(current.module, current.record) : current.module.path;
      await apiRequest(path, { method: isEdit ? 'PUT' : 'POST', body: payload });
      notify(`${current.module.singular} ${isEdit ? 'atualizado(a)' : 'cadastrado(a)'} com sucesso!`);
      await afterMutation(current.module);
    } catch (error) {
      notify(error.message, 'error');
    } finally { setBusy(false); }
  };

  const deleteRecord = async () => {
    if (!dialog || busy) return;
    const current = dialog;
    setBusy(true);
    try {
      await apiRequest(endpoint(current.module, current.record), { method: 'DELETE' });
      notify('Registro excluído com sucesso.');
      await afterMutation(current.module);
    } catch (error) {
      notify(error.message, 'error');
    } finally { setBusy(false); }
  };

  const analyzeReport = async (event) => {
    event.preventDefault();
    if (!dialog || busy) return;
    setBusy(true);
    try {
      await apiRequest(`${dialog.module.path}/${encodeURIComponent(dialog.record.idRelato)}/analisar`, {
        method: 'PUT',
        body: { idAdminRevisor: Number(analyzeValues.idAdminRevisor), statusAnalise: analyzeValues.statusAnalise },
      });
      notify(`Relato ${analyzeValues.statusAnalise === 'APROVADO' ? 'aprovado' : 'rejeitado'} com sucesso!`);
      await load('barreiras', true).catch(() => {});
      await afterMutation(dialog.module);
    } catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };

  const detailAdditionalData = async (module) => {
    const keys = module.key === 'estabelecimentos' ? ['estabelecimentos-recursos', 'recursos-acessibilidade', 'avaliacoes']
      : module.key === 'barreiras' ? ['relatos-resolucao', 'validacoes']
      : module.key === 'areas-acessiveis' ? ['validacoes'] : [];
    for (const key of keys) await load(key).catch(() => {});
  };

  const validSections = NAV.find((item) => item.key === page);
  const anyNetwork = Object.values(cache).some((rows) => Array.isArray(rows));

  return <div className="min-h-screen lg:pl-[262px] bg-[#f5f8fa]">
    {mobileMenu && <button aria-label="Fechar navegação" onClick={() => setMobileMenu(false)} className="fixed inset-0 bg-[#0e2c43]/50 z-[49] lg:hidden"/>}
    <aside className={`fixed z-50 inset-y-0 left-0 w-[262px] bg-[#133249] text-white flex flex-col transition-transform duration-200 lg:translate-x-0 ${mobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="px-6 pt-8 pb-9"><Brand light/><button className="lg:hidden absolute top-7 right-3 text-white/70 p-2" aria-label="Fechar menu" onClick={() => setMobileMenu(false)}><Icon name="X" size={20}/></button></div>
      <nav aria-label="Navegação principal" className="px-3 flex-1 space-y-1"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#7798a9] px-4 pb-3">MENU PRINCIPAL</p>{NAV.map((item) => <button key={item.key} onClick={() => navigate(item.key)} className={`relative w-full flex items-center gap-3 px-4 py-3.5 rounded-[13px] text-[13px] transition-colors ${page === item.key ? 'bg-[#28536a] text-white font-extrabold' : 'text-[#a9c2cc] font-semibold hover:text-white hover:bg-white/5'}`}><Icon name={item.icon} size={19}/><span>{item.label}</span>{page === item.key && <span className="absolute right-3 w-1.5 h-1.5 bg-[#37d7ca] rounded-full"/>}</button>)}</nav>
      <div className="m-4 rounded-[19px] bg-[#21465b] border border-white/8 p-4"><div className="inline-flex items-center gap-2 text-[11px] text-[#7fe7db] font-bold"><Icon name="ShieldAlert" size={15}/> Demonstração acadêmica</div><p className="text-[11px] text-[#afcbd5] leading-relaxed mt-2">Operações de cadastro e exclusão alteram o banco de dados real.</p><a href={BACKEND_URL} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-white font-bold text-[11px] hover:text-[#66dfd4]">Abrir API <Icon name="ExternalLink" size={13}/></a></div>
      <div className="px-6 py-5 border-t border-white/10"><p className="text-[#a3c0cb] text-[11px]">FIAP · Global Solution 2026.2</p><p className="mt-1 text-[#668fa2] text-[10px]">AcessoJá Web · v1.0</p></div>
    </aside>

    <div className="min-w-0">
      <header className="sticky top-0 z-30 bg-white/95 glass border-b border-[#e9eff2] h-[77px] px-4 sm:px-7 lg:px-9 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0"><button aria-label="Abrir menu" onClick={() => setMobileMenu(true)} className="lg:hidden p-2 rounded-xl bg-[#f3f7f8] text-[#315367]"><Icon name="Menu" size={21}/></button><div className="hidden sm:flex lg:hidden"><Brand compact/></div><div className="min-w-0"><p className="font-display font-extrabold text-[#1f3c50] text-[15px] truncate">{validSections?.label || 'AcessoJá'}</p><p className="hidden sm:block text-[11px] text-[#94a9b2] mt-0.5">Acessibilidade começa com informação.</p></div></div>
        <div className="flex items-center gap-3"><div className="hidden sm:flex items-center gap-2 border border-[#e4eeef] bg-[#f9fcfc] rounded-full px-3 py-2 text-[11px] font-bold text-[#567783]"><span className={`w-2 h-2 rounded-full ${anyNetwork ? 'bg-emerald-400 pulse-dot' : 'bg-amber-400'}`}/>{anyNetwork ? 'Dados da API carregados' : 'Conectando à API'}</div><Button variant="soft" size="sm" icon="Plus" className="!px-3 sm:!px-4" onClick={() => navigate('contribuir')}><span className="hidden sm:inline">Nova contribuição</span><span className="sm:hidden">Novo</span></Button><span aria-label="Modo demonstração" title="Modo de demonstração, sem login" className="h-9 w-9 flex items-center justify-center rounded-full bg-[#e8eff5] text-[#286580] font-bold text-xs">AJ</span></div>
      </header>

      <main className="max-w-[1510px] mx-auto px-4 sm:px-7 lg:px-9 pt-7 pb-12 min-h-[calc(100dvh-165px)]">
        {page === 'dashboard' && <Dashboard data={cache} loading={Object.values(loading).some(Boolean)} errors={errors} onNavigate={navigate} onCreate={openForm} onRefresh={refreshView}/>}
        {page === 'explorar' && <Explore type={exploreType} setType={setExploreType} items={cache[exploreType]} loading={loading[exploreType]} error={errors[exploreType]} bairros={cache.bairros} cidades={cache.cidades} onRefresh={refreshView} onCreate={openForm} onDetail={openDetail}/>}
        {page === 'contribuir' && <Contribute onCreate={openForm}/>}
        {page === 'gerenciar' && <EntityManager activeKey={activeModule} onModuleChange={setActiveModule} items={cache[activeModule]} loading={loading[activeModule]} error={errors[activeModule]} onRefresh={refreshView} onCreate={openForm} onEdit={(m,r) => openForm(m, {}, r)} onDetail={openDetail} onDelete={openDelete} onAnalyze={openAnalyze} query={managerQuery} setQuery={setManagerQuery}/>}
        {page === 'sobre' && <About onNavigate={navigate}/>}
      </main>
      <footer className="max-w-[1510px] mx-auto border-t border-[#e9eff1] px-4 sm:px-7 lg:px-9 py-5 flex flex-wrap gap-2 justify-between text-[11px] text-[#99aab2]"><span>© 2026 AcessoJá · Acessibilidade começa com informação.</span><span>Projeto acadêmico FIAP · React + Spring Boot + Oracle</span></footer>
    </div>

    <Dialog open={Boolean(dialog)} onClose={() => !busy && setDialog(null)} title={dialog?.type === 'form' ? `${dialog.mode === 'edit' ? 'Editar' : 'Novo(a)'} ${dialog.module.singular.toLowerCase()}` : dialog?.type === 'detail' ? 'Detalhes do registro' : dialog?.type === 'delete' ? 'Confirmar exclusão' : dialog?.type === 'analyze' ? 'Analisar relato de resolução' : ''} subtitle={dialog?.module?.title} width={dialog?.type === 'detail' ? 'max-w-3xl' : 'max-w-2xl'}>
      {dialog?.type === 'form' && <EntityForm key={`${dialog.module.key}-${dialog.mode}-${dialog.record?.[dialog.module.idField] ?? 'new'}`} module={dialog.module} mode={dialog.mode} record={dialog.record} prefill={dialog.prefill} suggestedId={suggestedId(dialog.module)} lookups={cache} busy={busy} onCancel={() => setDialog(null)} onSubmit={saveRecord}/>}
      {dialog?.type === 'delete' && <div><div className="rounded-2xl bg-rose-50 p-5 flex gap-3 border border-rose-100"><Icon name="AlertCircle" className="text-rose-500 shrink-0" size={23}/><div><p className="text-[#a34144] font-extrabold text-sm">Esta operação modifica o Oracle</p><p className="text-[#9c6870] text-xs mt-2 leading-relaxed">Você está prestes a excluir <strong>{getTitle(dialog.module, dialog.record)}</strong>. Esta ação não pode ser desfeita. Se houver chaves estrangeiras vinculadas, o Oracle pode recusar a exclusão.</p></div></div><div className="flex justify-end gap-2.5 mt-6"><Button variant="secondary" onClick={() => setDialog(null)}>Cancelar</Button><Button variant="danger" icon="Trash2" loading={busy} onClick={deleteRecord}>Excluir permanentemente</Button></div></div>}
      {dialog?.type === 'detail' && <RecordDetail key={`${dialog.module.key}-${dialog.record?.[dialog.module.idField]}`} module={dialog.module} record={dialog.record} related={cache} onLoadExtras={() => detailAdditionalData(dialog.module)} onClose={() => setDialog(null)} onEdit={() => openForm(dialog.module, {}, dialog.record)} onCreate={openForm} onAnalyze={() => openAnalyze(dialog.record)} />}
      {dialog?.type === 'analyze' && <form onSubmit={analyzeReport} className="space-y-4"><p className="text-sm text-[#607c8b] leading-relaxed">A análise modifica o status do relato e da barreira correspondente, em uma única transação Oracle.</p><label className="block text-xs font-bold text-[#38576a]">Administrador revisor<select className="input-base mt-2" value={analyzeValues.idAdminRevisor} onChange={(e) => setAnalyzeValues((v) => ({ ...v, idAdminRevisor: e.target.value }))}>{(cache.usuarios || []).filter((u) => u.perfil === 'ADMIN' && u.ativo === 'S').length ? (cache.usuarios || []).filter((u) => u.perfil === 'ADMIN' && u.ativo === 'S').map((u) => <option key={u.idUsuario} value={u.idUsuario}>#{u.idUsuario} · {u.nome}</option>) : <option value="1">Administrador ID 1</option>}</select></label><label className="block text-xs font-bold text-[#38576a]">Decisão<select className="input-base mt-2" value={analyzeValues.statusAnalise} onChange={(e) => setAnalyzeValues((v) => ({ ...v, statusAnalise: e.target.value }))}><option value="APROVADO">Aprovar — barreira resolvida</option><option value="REJEITADO">Rejeitar — barreira ativa</option></select></label><p className="text-xs p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-800">A API atual verifica o perfil do ID informado, mas não autentica quem está utilizando a tela. Utilize apenas para demonstração acadêmica.</p><div className="flex justify-end gap-2 pt-4"><Button variant="secondary" type="button" onClick={() => setDialog(null)}>Cancelar</Button><Button type="submit" icon="ShieldCheck" loading={busy}>Confirmar análise</Button></div></form>}
    </Dialog>
    <Toast toast={toast} onClose={() => setToast(null)}/>
  </div>;
}

function RecordDetail({ module, record, related, onLoadExtras, onClose, onEdit, onCreate, onAnalyze }) {
  const [extrasRequested, setExtrasRequested] = useState(false);
  const rowEntries = Object.entries(record).filter(([key]) => key !== 'senhaHash' && key !== 'senha' && key !== 'password');
  const linkedResources = module.key === 'estabelecimentos' ? (related['estabelecimentos-recursos'] || []).filter((r) => r.idEstabelecimento === record.idRegistro).map((association) => related['recursos-acessibilidade']?.find((r) => r.idRecurso === association.idRecurso)).filter(Boolean) : [];
  const reviews = module.key === 'estabelecimentos' ? (related.avaliacoes || []).filter((r) => r.idEstabelecimento === record.idRegistro) : [];
  const reports = module.key === 'barreiras' ? (related['relatos-resolucao'] || []).filter((r) => r.idBarreira === record.idRegistro) : [];
  const validations = ['barreiras','areas-acessiveis'].includes(module.key) ? (related.validacoes || []).filter((r) => r.idRegistro === record.idRegistro) : [];
  const availableExtraKeys = module.key === 'estabelecimentos' ? ['estabelecimentos-recursos','recursos-acessibilidade','avaliacoes'] : module.key === 'barreiras' ? ['relatos-resolucao','validacoes'] : module.key === 'areas-acessiveis' ? ['validacoes'] : [];
  const loadedExtras = availableExtraKeys.every((key) => related[key]);
  return <div>
    <div className="flex gap-4 items-start p-4 rounded-2xl bg-[#f2f8f9] mb-5"><span className="h-12 w-12 rounded-2xl bg-[#e0f5f1] flex items-center justify-center text-[#13a59c] shrink-0"><Icon name={module.icon} size={24}/></span><div className="min-w-0 flex-1"><h3 className="text-base font-display font-extrabold text-[#214154]">{getTitle(module,record)}</h3><p className="text-xs text-[#8196a2] mt-1">{module.title} · {module.composite ? `IDs ${record.idEstabelecimento}/${record.idRecurso}` : `ID #${record[module.idField]}`}</p><div className="mt-2 flex gap-2">{record.statusModeracao && <StatusPill status={record.statusModeracao}/>} {record.statusBarreira && <StatusPill status={record.statusBarreira}/>}</div></div></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">{rowEntries.map(([key,value]) => <div key={key} className={`${['descricao','caracteristicas','comentario','endereco'].includes(key) ? 'sm:col-span-2' : ''} border-b border-[#f0f4f5] pb-3`}><p className="text-[11px] font-bold uppercase tracking-[.05em] text-[#9baeb7] mb-1.5">{getFieldLabel(module,key)}</p><div className="text-[13px] leading-relaxed text-[#355467] break-words">{looksLikeStatus(key) && value ? <StatusPill status={value} /> : displayValue(value)}</div></div>)}</div>
    {availableExtraKeys.length > 0 && <div className="border-t border-[#eaf1f3] mt-6 pt-5"><div className="flex items-center justify-between flex-wrap gap-3 mb-4"><h4 className="text-sm font-extrabold text-[#264a5e]">Dados relacionados</h4>{!loadedExtras && <Button variant="secondary" icon="RefreshCw" size="sm" onClick={() => { setExtrasRequested(true); onLoadExtras(); }}>Carregar relações</Button>}</div>{loadedExtras ? <div className="space-y-3">{linkedResources.length > 0 && <div><p className="text-xs font-bold text-[#718d98] mb-2">Recursos de acessibilidade</p><div className="flex flex-wrap gap-2">{linkedResources.map((r) => <span key={r.idRecurso} className="bg-[#e4f7f2] text-[#108f82] text-xs font-bold px-3 py-1.5 rounded-full">{r.nome}</span>)}</div></div>}{reviews.length > 0 && <div><p className="text-xs font-bold text-[#718d98] mb-2">Avaliações</p>{reviews.map((r) => <div key={r.idAvaliacao} className="rounded-xl bg-[#f7fafa] p-3 mb-2 text-xs"><span className="text-amber-500 font-bold">★ {r.nota}/5</span><span className="ml-2 text-[#647c87]">{r.comentario || 'Sem comentário'}</span></div>)}</div>}{reports.length > 0 && <div><p className="text-xs font-bold text-[#718d98] mb-2">Relatos de resolução</p>{reports.map((r) => <div key={r.idRelato} className="flex justify-between gap-3 items-center rounded-xl bg-[#f7fafa] p-3 mb-2"><span className="text-xs text-[#647b89]">#{r.idRelato} · {r.descricao}</span><StatusPill subtle status={r.statusAnalise}/></div>)}</div>}{validations.length > 0 && <div><p className="text-xs font-bold text-[#718d98] mb-2">Validações comunitárias</p>{validations.map((v) => <div className="flex items-center gap-2 text-xs mt-2" key={v.idValidacao}><StatusPill subtle status={v.tipoValidacao}/><span className="text-[#6a828e]">{v.comentario || `Usuário #${v.idUsuario}`}</span></div>)}</div>}{linkedResources.length === 0 && reviews.length === 0 && reports.length === 0 && validations.length === 0 && <p className="text-xs text-[#8fa3ac]">Nenhuma informação relacionada cadastrada.</p>}</div> : <p className="text-xs text-[#94a7b0]">{extrasRequested ? 'Consultando dados relacionados...' : 'Carregue os recursos, avaliações e relatos vinculados a este item.'}</p>}</div>}
    <div className="border-t border-[#eaf1f3] mt-6 pt-5 flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={onClose}>Fechar</Button>{module.key === 'estabelecimentos' && <Button variant="soft" icon="Star" onClick={() => onCreate(MODULE_BY_KEY.avaliacoes, { idEstabelecimento: record.idRegistro })}>Avaliar</Button>}{['estabelecimentos','areas-acessiveis','barreiras'].includes(module.key) && <Button variant="soft" icon="BadgeCheck" onClick={() => onCreate(MODULE_BY_KEY.validacoes, { idRegistro: record.idRegistro })}>Validar</Button>}{module.key === 'barreiras' && record.statusBarreira === 'ATIVA' && <Button variant="soft" icon="ClipboardCheck" onClick={() => onCreate(MODULE_BY_KEY['relatos-resolucao'], { idBarreira: record.idRegistro })}>Informar resolução</Button>}{module.key === 'relatos-resolucao' && record.statusAnalise === 'PENDENTE' && <Button variant="soft" icon="ShieldCheck" onClick={onAnalyze}>Analisar relato</Button>}<Button variant="navy" icon="Pencil" onClick={onEdit}>Editar no painel</Button></div>
  </div>;
}

function About({ onNavigate }) {
  return <div className="animate-rise"><PageHeader eyebrow="Sobre o AcessoJá" title="Tecnologia a serviço da inclusão" description="Projeto de acessibilidade urbana colaborativa desenvolvido para a Global Solution 2026.2 da FIAP."/>
    <div className="rounded-[27px] relative overflow-hidden bg-[#173a51] text-white p-7 sm:p-9 mb-6"><span className="inline-flex items-center gap-2 font-bold text-[#55d9cc] text-xs"><Icon name="Accessibility"/> Acessibilidade começa com informação.</span><h2 className="font-display text-2xl sm:text-3xl font-extrabold mt-4 max-w-xl leading-tight">Uma plataforma colaborativa para cidades mais acessíveis.</h2><p className="max-w-2xl mt-4 text-sm text-[#c2d7de] leading-relaxed">O AcessoJá reúne informações sobre locais acessíveis, obstáculos urbanos, avaliações e relatos de resolução, com uma API REST em Java conectada ao Oracle. Este painel React permite demonstrar a integração de ponta a ponta.</p><div className="mt-6"><Button onClick={() => onNavigate('explorar')} icon="Compass">Conhecer os locais</Button></div><div className="hidden sm:block absolute w-56 h-56 rounded-full bg-[#30c7bd]/15 blur-xl -right-14 -bottom-24"/></div>
    <div className="grid md:grid-cols-3 gap-4 mb-6">{[
      { title: 'Backend', icon: 'Database', desc: 'Java 21 · Spring Boot · JDBC · Oracle Database', url: 'https://github.com/pedrofaleirosss/acessoja-api', label: 'Ver código da API' },
      { title: 'Frontend', icon: 'LayoutDashboard', desc: 'React · Vite · Tailwind CSS · Lucide React', url: null, label: 'Interface web responsiva' },
      { title: 'Hospedagem', icon: 'Globe2', desc: 'API REST publicada no Render', url: BACKEND_URL, label: 'Acessar backend' },
    ].map((item) => <div key={item.title} className="bg-white border border-[#e8eff2] rounded-[22px] p-6 shadow-soft"><span className="h-12 w-12 rounded-2xl flex items-center justify-center bg-[#e6f7f5] text-[#12a39a]"><Icon name={item.icon} size={22}/></span><h3 className="mt-4 font-display text-lg font-extrabold text-[#234456]">{item.title}</h3><p className="text-sm text-[#8197a4] min-h-[54px] mt-2 leading-relaxed">{item.desc}</p>{item.url ? <a className="text-sm font-bold text-[#129b93] mt-3 inline-flex gap-1 items-center" href={item.url} target="_blank" rel="noreferrer">{item.label}<Icon name="ExternalLink" size={15}/></a> : <p className="text-[#129b93] text-sm font-bold mt-3">{item.label}</p>}</div>)}</div>
    <div className="bg-white rounded-[22px] border border-[#e8eff2] p-6 shadow-soft"><h3 className="font-display font-extrabold text-[#234456] text-lg flex items-center gap-2"><Icon name="ShieldAlert" size={20} className="text-[#d69c55]"/> Importante sobre este MVP</h3><p className="text-sm text-[#728c99] leading-relaxed mt-3">A API atual foi desenvolvida para fins acadêmicos e demonstração. Ela possui CRUD das 12 entidades, mas ainda não implementa login e autorização. O gerenciamento desta interface altera dados reais. Para disponibilização pública com segurança, é necessário adicionar autenticação, autorização e controles administrativos no backend.</p></div>
  </div>;
}
