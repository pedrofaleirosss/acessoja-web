const number = (key, label, extras = {}) => ({ key, label, type: 'number', required: true, ...extras });
const text = (key, label, extras = {}) => ({ key, label, type: 'text', required: true, ...extras });
const longText = (key, label, extras = {}) => ({ key, label, type: 'textarea', required: true, ...extras });
const choice = (key, label, options, extras = {}) => ({ key, label, type: 'select', options, required: true, ...extras });
const optionalText = (key, label, extras = {}) => text(key, label, { required: false, ...extras });
const id = (key, label) => number(key, label, { edit: false, help: 'ID manual: utilize um número ainda disponível no Oracle.' });
const fk = (key, label, ref, extras = {}) => number(key, label, { ref, ...extras });
const loc = [
  fk('idUsuarioAutor', 'ID do autor', 'usuarios', { edit: false }),
  fk('idBairro', 'Bairro', 'bairros'),
  text('titulo', 'Título', { maxLength: 150 }),
  longText('descricao', 'Descrição', { maxLength: 500 }),
  text('endereco', 'Endereço', { maxLength: 200 }),
];

export const MODULES = [
  {
    key: 'cidades', path: '/cidades', title: 'Cidades', singular: 'Cidade', category: 'base', icon: 'building-2', color: 'blue',
    idField: 'idCidade', columns: ['idCidade', 'nome', 'uf'],
    fields: [id('idCidade', 'ID da cidade'), text('nome', 'Nome da cidade', { maxLength: 100 }), text('uf', 'UF', { maxLength: 2, placeholder: 'SP' })],
  },
  {
    key: 'bairros', path: '/bairros', title: 'Bairros', singular: 'Bairro', category: 'base', icon: 'map-pin', color: 'blue',
    idField: 'idBairro', columns: ['idBairro', 'nome', 'idCidade'],
    fields: [id('idBairro', 'ID do bairro'), text('nome', 'Nome do bairro', { maxLength: 100 }), fk('idCidade', 'Cidade', 'cidades')],
  },
  {
    key: 'usuarios', path: '/usuarios', title: 'Usuários', singular: 'Usuário', category: 'base', icon: 'users', color: 'blue',
    idField: 'idUsuario', columns: ['idUsuario', 'nome', 'email', 'perfil', 'ativo'],
    fields: [id('idUsuario', 'ID do usuário'), text('nome', 'Nome completo', { maxLength: 120 }), text('email', 'E-mail', { type: 'email', maxLength: 150 }), text('senha', 'Senha', { type: 'password', minLength: 8, help: 'Mínimo de 8 caracteres. Na edição, deixe vazio para manter a senha.', required: true, list: false })],
  },
  {
    key: 'registros', path: '/registros', title: 'Registros gerais', singular: 'Registro', category: 'locais', icon: 'files', color: 'blue',
    idField: 'idRegistro', columns: ['idRegistro', 'titulo', 'tipoRegistro', 'statusModeracao', 'idBairro'],
    warning: 'O cadastro genérico cria apenas a linha REGISTRO. Para estabelecimentos, áreas e barreiras, prefira os formulários específicos.',
    fields: [id('idRegistro', 'ID do registro'), ...loc, choice('tipoRegistro', 'Tipo', ['ESTABELECIMENTO', 'AREA', 'BARREIRA'], { edit: false })],
  },
  {
    key: 'estabelecimentos', path: '/estabelecimentos', title: 'Estabelecimentos', singular: 'Estabelecimento', category: 'locais', icon: 'store', color: 'mint',
    idField: 'idRegistro', idSource: 'registros', columns: ['idRegistro', 'titulo', 'categoria', 'endereco', 'statusModeracao'],
    fields: [id('idRegistro', 'ID do registro'), ...loc, text('categoria', 'Categoria', { placeholder: 'Ex.: Farmácia', maxLength: 60 })],
  },
  {
    key: 'areas-acessiveis', path: '/areas-acessiveis', title: 'Áreas acessíveis', singular: 'Área acessível', category: 'locais', icon: 'trees', color: 'mint',
    idField: 'idRegistro', idSource: 'registros', columns: ['idRegistro', 'titulo', 'tipoArea', 'endereco', 'statusModeracao'],
    fields: [id('idRegistro', 'ID do registro'), ...loc, text('tipoArea', 'Tipo de área', { placeholder: 'Ex.: Praça, Parque', maxLength: 60 }), longText('caracteristicas', 'Características de acessibilidade', { maxLength: 500 })],
  },
  {
    key: 'barreiras', path: '/barreiras', title: 'Barreiras urbanas', singular: 'Barreira', category: 'locais', icon: 'construction', color: 'coral',
    idField: 'idRegistro', idSource: 'registros', columns: ['idRegistro', 'titulo', 'tipoBarreira', 'statusBarreira', 'statusModeracao'],
    fields: [id('idRegistro', 'ID do registro'), ...loc, text('tipoBarreira', 'Tipo de barreira', { placeholder: 'Ex.: Calçada quebrada', maxLength: 60 })],
  },
  {
    key: 'recursos-acessibilidade', path: '/recursos-acessibilidade', title: 'Recursos de acessibilidade', singular: 'Recurso', category: 'recursos', icon: 'accessibility', color: 'mint',
    idField: 'idRecurso', columns: ['idRecurso', 'nome', 'descricao'],
    fields: [id('idRecurso', 'ID do recurso'), text('nome', 'Nome do recurso', { maxLength: 100 }), optionalText('descricao', 'Descrição', { type: 'textarea', maxLength: 300 })],
  },
  {
    key: 'estabelecimentos-recursos', path: '/estabelecimentos-recursos', title: 'Vínculos estabelecimento–recurso', singular: 'Vínculo', category: 'recursos', icon: 'link-2', color: 'mint',
    idField: 'idEstabelecimento', composite: true, columns: ['idEstabelecimento', 'idRecurso'],
    fields: [fk('idEstabelecimento', 'Estabelecimento', 'estabelecimentos', { edit: false }), fk('idRecurso', 'Recurso de acessibilidade', 'recursos-acessibilidade', { updateLabel: 'Novo recurso' })],
  },
  {
    key: 'avaliacoes', path: '/avaliacoes', title: 'Avaliações', singular: 'Avaliação', category: 'comunidade', icon: 'star', color: 'gold',
    idField: 'idAvaliacao', columns: ['idAvaliacao', 'idUsuario', 'idEstabelecimento', 'nota', 'comentario'],
    fields: [id('idAvaliacao', 'ID da avaliação'), fk('idUsuario', 'Usuário avaliador', 'usuarios', { edit: false }), fk('idEstabelecimento', 'Estabelecimento', 'estabelecimentos', { edit: false }), number('nota', 'Nota de 1 a 5', { min: 1, max: 5 }), optionalText('comentario', 'Comentário', { type: 'textarea', maxLength: 500 })],
  },
  {
    key: 'validacoes', path: '/validacoes', title: 'Validações', singular: 'Validação', category: 'comunidade', icon: 'badge-check', color: 'mint',
    idField: 'idValidacao', columns: ['idValidacao', 'idUsuario', 'idRegistro', 'tipoValidacao', 'comentario'],
    fields: [id('idValidacao', 'ID da validação'), fk('idUsuario', 'Usuário', 'usuarios', { edit: false }), fk('idRegistro', 'Registro', 'registros', { edit: false }), choice('tipoValidacao', 'Tipo de validação', ['CONFIRMA', 'CONTESTA']), optionalText('comentario', 'Comentário / justificativa', { type: 'textarea', maxLength: 500 })],
  },
  {
    key: 'relatos-resolucao', path: '/relatos-resolucao', title: 'Relatos de resolução', singular: 'Relato', category: 'comunidade', icon: 'clipboard-check', color: 'coral',
    idField: 'idRelato', columns: ['idRelato', 'idBarreira', 'idUsuario', 'statusAnalise', 'descricao'],
    fields: [id('idRelato', 'ID do relato'), fk('idBarreira', 'Barreira', 'barreiras', { edit: false }), fk('idUsuario', 'Usuário responsável', 'usuarios', { edit: false }), longText('descricao', 'Descrição da resolução', { maxLength: 500 })],
  },
];

export const MODULE_BY_KEY = Object.fromEntries(MODULES.map((item) => [item.key, item]));

export const getFieldLabel = (module, key) => {
  const special = { statusModeracao: 'Moderação', statusBarreira: 'Situação', dataCadastro: 'Data de cadastro', dataRelato: 'Data do relato', dataAvaliacao: 'Data da avaliação', dataValidacao: 'Data da validação', dataModeracao: 'Data da moderação', dataAnalise: 'Data da análise', idAdminModerador: 'Moderador', idAdminRevisor: 'Revisor', perfil: 'Perfil', ativo: 'Ativo', tipoRegistro: 'Tipo de registro', idRegistro: 'Registro', titulo: 'Título', nota: 'Nota', nome: 'Nome', categoria: 'Categoria' };
  return module.fields.find((field) => field.key === key)?.label || special[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
};

export const getTitle = (module, record) => record?.titulo || record?.nome || record?.email || record?.descricao?.slice(0, 48) || `${module.singular} ${record?.[module.idField] || ''}`;

export const labelForRef = (moduleKey, record) => {
  const module = MODULE_BY_KEY[moduleKey];
  const key = module?.idField;
  const idValue = record?.[key];
  return `#${idValue} · ${getTitle(module || { singular: moduleKey }, record)}`;
};

export const displayValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  if (value === 'S') return 'Sim';
  if (value === 'N') return 'Não';
  return String(value);
};

export const looksLikeStatus = (key) => ['statusModeracao', 'statusBarreira', 'statusAnalise', 'tipoValidacao', 'perfil'].includes(key);
