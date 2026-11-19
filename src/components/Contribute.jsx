import { MODULE_BY_KEY } from '../data/modules.js';
import { Button, Icon, PageHeader } from './Ui.jsx';

const tasks = [
  { key: 'estabelecimentos', title: 'Cadastrar estabelecimento', description: 'Ajude outras pessoas a encontrar comércios e serviços acessíveis.', icon: 'Store', color: 'bg-[#e7f8f5] text-[#10a99f]', tag: 'Local acessível' },
  { key: 'areas-acessiveis', title: 'Indicar área acessível', description: 'Compartilhe praças, parques e espaços públicos adaptados.', icon: 'Trees', color: 'bg-[#e8f2ff] text-[#5d91c7]', tag: 'Espaço público' },
  { key: 'barreiras', title: 'Reportar uma barreira', description: 'Registre obstáculos que dificultam a mobilidade das pessoas.', icon: 'Construction', color: 'bg-[#fff0e7] text-[#de8960]', tag: 'Barreira urbana' },
  { key: 'avaliacoes', title: 'Avaliar um estabelecimento', description: 'Dê uma nota e compartilhe sua experiência de acessibilidade.', icon: 'Star', color: 'bg-[#fff8df] text-[#d5a73b]', tag: 'Avaliação' },
  { key: 'validacoes', title: 'Confirmar ou contestar', description: 'Contribua para manter as informações da comunidade corretas.', icon: 'BadgeCheck', color: 'bg-[#e8f8f5] text-[#12a99c]', tag: 'Colaboração' },
  { key: 'relatos-resolucao', title: 'Informar resolução', description: 'Avise quando uma barreira urbana tiver sido corrigida.', icon: 'ClipboardCheck', color: 'bg-[#f1edff] text-[#9278c9]', tag: 'Resolução' },
];

export default function Contribute({ onCreate }) {
  return <div className="animate-rise">
    <PageHeader eyebrow="Comunidade em movimento" title="Compartilhe uma contribuição" description="Cada informação ajuda a construir uma experiência mais acessível para todos. Escolha o tipo de contribuição abaixo." />
    <div className="rounded-[24px] bg-[#17374f] text-white p-6 sm:p-8 mb-6 overflow-hidden relative"><div className="relative z-10 max-w-xl"><div className="inline-flex items-center gap-2 text-[#67ddd1] text-[11px] uppercase tracking-[.15em] font-extrabold"><Icon name="HeartHandshake" size={17}/> Juntos, fazemos a diferença</div><h2 className="font-display text-2xl font-extrabold mt-3 tracking-tight">Uma contribuição pode mudar o caminho de alguém.</h2><p className="text-sm leading-relaxed mt-3 text-[#b9d1da]">As informações enviadas são registradas na API Java e armazenadas no Oracle. Novos locais e barreiras começam com moderação pendente.</p></div><div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[45px] border-[#25c1b7]/16"/></div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{tasks.map((task) => <div key={task.key} className="bg-white rounded-[22px] border border-[#e8f0f2] p-5 sm:p-6 flex flex-col shadow-soft card-hover"><div className="flex items-start justify-between"><span className={`h-14 w-14 rounded-2xl flex items-center justify-center ${task.color}`}><Icon name={task.icon} size={25}/></span><span className="text-[10px] uppercase tracking-[.1em] font-bold text-[#9badb7]">{task.tag}</span></div><h3 className="font-display text-base font-extrabold text-[#1a3d52] mt-5">{task.title}</h3><p className="text-[12px] text-[#8095a2] leading-relaxed mt-2 flex-1">{task.description}</p><Button variant="secondary" icon="Plus" className="w-full mt-5" onClick={() => onCreate(MODULE_BY_KEY[task.key])}>Criar contribuição</Button></div>)}</div>
    <div className="mt-6 bg-[#f0f7f8] border border-[#dcebed] rounded-2xl p-4 flex items-start gap-3"><Icon name="Info" size={19} className="text-[#42a9a3] shrink-0 mt-0.5"/><p className="text-xs text-[#65848f] leading-relaxed"><strong>Ambiente acadêmico:</strong> o backend atual não realiza autenticação. Os formulários solicitam o ID de um usuário existente para fins de demonstração. Não utilize dados pessoais reais nos testes.</p></div>
  </div>;
}
