import { useEffect, useId } from 'react';
import {
  Accessibility, AlertCircle, ArrowDownRight, ArrowLeft, ArrowRight, BadgeCheck,
  Building2, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, ClipboardCheck, Construction, Database, ExternalLink, FileText,
  Files, Filter, Globe2, HeartHandshake, Info, LayoutDashboard, Link2,
  LoaderCircle, MapPin, Menu, MoreHorizontal, Pencil, Plus, RefreshCw,
  Search, ShieldAlert, ShieldCheck, Sparkles, Star, Store, Trash2, Trees,
  Users, X, Wifi, WifiOff, Compass, ArrowUpRight, List, Eye, SlidersHorizontal,
} from 'lucide-react';

const icons = { Accessibility, AlertCircle, ArrowDownRight, ArrowLeft, ArrowRight, BadgeCheck, Building2, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ClipboardCheck, Construction, Database, ExternalLink, FileText, Files, Filter, Globe2, HeartHandshake, Info, LayoutDashboard, Link2, LoaderCircle, MapPin, Menu, MoreHorizontal, Pencil, Plus, RefreshCw, Search, ShieldAlert, ShieldCheck, Sparkles, Star, Store, Trash2, Trees, Users, X, Wifi, WifiOff, Compass, ArrowUpRight, List, Eye, SlidersHorizontal };
export function Icon({ name, size = 18, strokeWidth = 1.9, className = '', ...props }) {
  const key = String(name || '').split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  const Component = icons[name] || icons[key] || CircleHelp;
  return <Component aria-hidden="true" size={size} strokeWidth={strokeWidth} className={className} {...props} />;
}

export function Brand({ compact = false, light = false }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span className="h-11 w-11 rounded-[15px] bg-[#25bdb5] inline-flex items-center justify-center shrink-0 shadow-[0_7px_20px_rgba(28,193,179,.24)]">
        <svg role="img" aria-label="Símbolo de acessibilidade" width="31" height="31" viewBox="0 0 64 64" fill="none">
          <path d="M32 5c-12.2 0-22 9.9-22 22 0 16.5 22 33 22 33s22-16.5 22-33C54 14.9 44.2 5 32 5Z" fill="#fff"/>
          <circle cx="32" cy="26" r="16" fill="#20b9b1"/>
          <circle cx="29" cy="17.5" r="3.1" fill="#fff"/>
          <path d="M29 24v11h9m-8-6h-6c-5 1-7 4-7 9a10 10 0 0 0 17 7m-3-21 6 13h7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      {!compact && <span className="min-w-0">
        <span className={`block font-display font-extrabold text-[22px] tracking-[-1px] leading-none ${light ? 'text-white' : 'text-[#17364b]'}`}>Acesso<span className="text-[#1fbfb5]">Já</span></span>
        <span className={`text-[9px] uppercase tracking-[.12em] font-semibold mt-1.5 block ${light ? 'text-white/55' : 'text-slate-400'}`}>Acessibilidade começa aqui</span>
      </span>}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', icon, className = '', loading = false, ...props }) {
  const variants = {
    primary: 'bg-[#20bbb2] text-white hover:bg-[#159f99] shadow-[0_7px_18px_rgba(21,159,153,.18)]',
    navy: 'bg-[#18384f] text-white hover:bg-[#102d43]',
    secondary: 'bg-white text-[#26475a] border border-[#dce7eb] hover:bg-[#f5fafb]',
    soft: 'bg-[#e8f8f6] text-[#087f79] hover:bg-[#d4f0ec]',
    danger: 'bg-[#d85350] text-white hover:bg-[#b94340]',
    ghost: 'text-[#536b78] hover:bg-[#edf4f6]',
  };
  const sizes = { sm: 'min-h-9 px-3 text-xs', md: 'min-h-10 px-4 text-sm', lg: 'min-h-12 px-5 text-sm' };
  return <button className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
    {loading ? <Icon name="LoaderCircle" className="animate-spin" size={16}/> : icon ? <Icon name={icon} size={16}/> : null}{children}
  </button>;
}

export function StatusPill({ status, subtle = false }) {
  const value = String(status || '').toUpperCase();
  let color = 'bg-slate-100 text-slate-600 border-slate-200';
  if (['APROVADO', 'RESOLVIDA', 'CONFIRMA', 'S', 'ATIVO'].includes(value)) color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (['PENDENTE', 'RESOLUCAO_INFORMADA'].includes(value)) color = 'bg-amber-50 text-amber-700 border-amber-200';
  if (['REJEITADO', 'ATIVA', 'CONTESTA', 'N'].includes(value)) color = 'bg-rose-50 text-rose-700 border-rose-200';
  const labels = { RESOLUCAO_INFORMADA: 'Resolução informada', APROVADO: 'Aprovado', PENDENTE: 'Pendente', REJEITADO: 'Rejeitado', RESOLVIDA: 'Resolvida', ATIVA: 'Ativa', CONFIRMA: 'Confirma', CONTESTA: 'Contesta', S: 'Ativo', N: 'Inativo' };
  return <span className={`inline-flex items-center gap-1 rounded-full border font-bold whitespace-nowrap ${subtle ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'} ${color}`}><span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />{labels[value] || value || 'Não informado'}</span>;
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
    <div className="max-w-2xl"><p className="text-[#14a99f] text-[11px] font-extrabold tracking-[.17em] uppercase mb-2">{eyebrow}</p><h1 className="font-display tracking-[-.035em] text-2xl sm:text-[32px] leading-tight font-extrabold text-[#153249]">{title}</h1>{description && <p className="mt-2.5 text-[13px] sm:text-sm leading-relaxed text-[#718894]">{description}</p>}</div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </div>;
}

export function LoadingBlock({ label = 'Carregando informações...' }) {
  return <div className="flex flex-col justify-center items-center gap-3 py-16 text-[#77919a]"><span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e0f7f3]"><Icon name="LoaderCircle" className="animate-spin text-[#159e98]" size={23}/></span><p className="text-sm font-semibold">{label}</p><span className="text-xs text-[#97a7b0]">O Render pode demorar na primeira requisição.</span></div>;
}

export function EmptyBlock({ title = 'Nenhum resultado encontrado', description, icon = 'Search', action }) {
  return <div className="flex flex-col items-center text-center py-14 px-6"><span className="rounded-[20px] bg-[#eff7f8] w-16 h-16 flex items-center justify-center text-[#48a8a5] mb-4"><Icon name={icon} size={27}/></span><h3 className="font-display font-extrabold text-[#214056]">{title}</h3>{description && <p className="text-sm text-[#899ba5] max-w-sm mt-2">{description}</p>}{action && <div className="mt-5">{action}</div>}</div>;
}

export function ErrorBlock({ error, onRetry }) {
  return <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:p-6 text-rose-900 flex flex-wrap gap-4 items-start justify-between">
    <div className="flex items-start gap-3"><span className="p-2 rounded-xl bg-white/70"><Icon name="AlertCircle" size={20}/></span><div><p className="font-bold text-sm">Não conseguimos consultar a API</p><p className="text-sm opacity-80 mt-1 max-w-xl">{error?.message || 'Tente novamente.'}</p></div></div>
    {onRetry && <Button variant="secondary" size="sm" icon="RefreshCw" onClick={onRetry}>Tentar novamente</Button>}
  </div>;
}

export function Dialog({ title, subtitle, open, onClose, children, width = 'max-w-2xl' }) {
  const headingId = useId();
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="fixed z-[80] inset-0 flex items-center justify-center p-3 sm:p-5" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="absolute inset-0 bg-[#0b2439]/65 backdrop-blur-[4px]" />
    <section role="dialog" aria-modal="true" aria-labelledby={headingId} className={`relative w-full ${width} bg-[#fdfefe] rounded-[25px] sm:rounded-[28px] max-h-[94dvh] flex flex-col shadow-float overflow-hidden animate-rise`}>
      <div className="flex items-start justify-between gap-4 border-b border-[#edf2f4] px-5 sm:px-7 py-5 shrink-0"><div><h2 id={headingId} className="font-display text-xl font-extrabold tracking-[-.02em] text-[#19364b]">{title}</h2>{subtitle && <p className="text-xs text-[#8194a1] mt-1">{subtitle}</p>}</div><button aria-label="Fechar janela" onClick={onClose} className="h-9 w-9 rounded-xl bg-[#f2f6f8] flex items-center justify-center text-[#486777] hover:bg-[#e5f1f2]"><Icon name="X" size={18}/></button></div>
      <div className="overflow-y-auto sheet-scroll px-5 sm:px-7 py-5 sm:py-6">{children}</div>
    </section>
  </div>;
}

export function Toast({ toast, onClose }) {
  if (!toast) return null;
  const error = toast.type === 'error';
  return <div role="status" aria-live="polite" className="fixed bottom-4 right-4 left-4 sm:left-auto z-[110] sm:w-[370px] animate-rise rounded-[18px] shadow-float bg-[#16344b] text-white p-4 flex items-start gap-3"><span className={`rounded-xl p-2 shrink-0 ${error ? 'bg-rose-400/20 text-rose-200' : 'bg-[#1fbcb2]/20 text-[#63e6dc]'}`}><Icon name={error ? 'AlertCircle' : 'CheckCircle2'} size={20}/></span><div className="flex-1"><p className="font-bold text-sm">{error ? 'Algo não saiu como esperado' : 'Tudo certo!'}</p><p className="text-[12px] text-white/70 mt-0.5 leading-relaxed">{toast.message}</p></div><button onClick={onClose} aria-label="Fechar aviso" className="text-white/60 hover:text-white"><Icon name="X" size={18}/></button></div>;
}
