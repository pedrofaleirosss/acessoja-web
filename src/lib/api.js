const configuredBase = import.meta.env.VITE_API_BASE_URL;
export const API_BASE = (configuredBase || '/api').replace(/\/$/, '');
export const BACKEND_URL = 'https://acessoja-api.onrender.com';

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body } = options;
  const controller = new AbortController();
  // Serviços gratuitos do Render podem demorar para despertar.
  const timer = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const content = await response.text();
    let parsed;
    try { parsed = content ? JSON.parse(content) : null; } catch { parsed = null; }
    if (!response.ok) {
      let message = parsed?.erro || parsed?.message || parsed?.error;
      if (!message || message === 'Internal Server Error') {
        message = {
          400: 'Verifique os campos enviados.',
          403: 'Você não tem permissão para esta operação.',
          404: 'Registro não encontrado.',
          405: 'Método não permitido.',
          409: 'O registro possui uma restrição de integridade ou já existe.',
          500: 'O servidor ou o banco Oracle encontrou um erro.',
          502: 'A API não está respondendo. Tente novamente.',
          503: 'O serviço está indisponível temporariamente.',
        }[response.status] || `Não foi possível concluir a requisição (HTTP ${response.status}).`;
      }
      throw new ApiError(message, response.status, parsed);
    }
    return parsed;
  } catch (error) {
    if (error.name === 'AbortError') throw new ApiError('A API demorou para responder. O serviço do Render pode estar iniciando.', 0);
    if (error instanceof ApiError) throw error;
    throw new ApiError('Não foi possível acessar a API. Verifique a internet, o serviço no Render e a configuração de proxy/CORS.', 0);
  } finally {
    clearTimeout(timer);
  }
}

export const endpoint = (module, record) => {
  const encoded = (id) => encodeURIComponent(String(id));
  if (module.key === 'estabelecimentos-recursos') {
    return `${module.path}/${encoded(record.idEstabelecimento)}/${encoded(record.idRecurso)}`;
  }
  return `${module.path}/${encoded(record[module.idField])}`;
};

export const listRows = async (module) => {
  const result = await apiRequest(module.path);
  if (!Array.isArray(result)) throw new ApiError('A API retornou um formato inesperado.', 0);
  return result;
};
