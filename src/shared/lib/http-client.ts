import { FetchError, ofetch, type FetchContext } from 'ofetch';

const fieldNames: Record<string, string> = {
  login: 'Логин',
  password: 'Пароль',
  title: 'Название',
  name: 'Название группы',
  description: 'Описание',
  priority: 'Приоритет',
  status: 'Статус',
  assignee_id: 'Исполнитель',
};

const details: Record<string, string> = {
  'Checklist not found': 'Чеклист недоступен.',
  'Checklist item not found': 'Пункт удалён. Обновите чеклист.',
  'CSRF validation failed': 'Не удалось проверить запрос. Повторите действие.',
  'Invalid login or password': 'Неверный логин или пароль.',
  'Login already taken': 'Этот логин уже занят. Выберите другой.',
  'Completed tasks are read-only':
    'Задача уже выполнена. Доступен только просмотр.',
  'The owner cannot leave the group':
    'Владелец не может выйти из группы или исключить себя.',
  'A personal task can only be assigned to its owner':
    'Личную задачу можно назначить только себе.',
  'The assignee must be a group member':
    'Исполнитель уже не состоит в группе. Выберите другого.',
};

const networkError =
  'Не удалось связаться с сервером. Проверьте соединение и попробуйте снова.';

let privateRequests = new AbortController();
let csrfRequest: { baseURL?: string; promise: Promise<string> } | undefined;
const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

export function abortPrivateRequests() {
  privateRequests.abort();
  privateRequests = new AbortController();
  csrfRequest = undefined;
}

function checkConnection({ options }: FetchContext) {
  if (
    !safeMethods.has((options.method ?? 'GET').toUpperCase()) &&
    !navigator.onLine
  ) {
    throw new Error(networkError);
  }
}

const transport = ofetch.create({
  baseURL: import.meta.env?.VITE_API_URL,
  credentials: 'include',
  cache: 'no-store',
  retry: 0,
  onRequest: checkConnection,
});

async function withCsrf({ options }: FetchContext) {
  if (safeMethods.has((options.method ?? 'GET').toUpperCase())) return;
  if (!csrfRequest || csrfRequest.baseURL !== options.baseURL) {
    const promise = transport<{ csrf_token: string }>('/auth/csrf', {
      baseURL: options.baseURL,
    }).then((data) => {
      if (!data.csrf_token) throw new Error('Сервер не выдал CSRF-токен.');
      return data.csrf_token;
    });
    csrfRequest = { baseURL: options.baseURL, promise };
  }
  const current = csrfRequest;
  try {
    options.headers.set('X-CSRF-Token', await current.promise);
  } catch (error) {
    if (csrfRequest === current) csrfRequest = undefined;
    throw error;
  }
}

// Login/register and their CSRF bootstrap are independent of private request cancellation.
export const authFetch = transport.create({
  onRequest: [checkConnection, withCsrf],
  onResponseError: ({ response }) => {
    if (
      response.status === 403 &&
      response._data?.detail === 'CSRF validation failed'
    ) {
      csrfRequest = undefined;
    }
  },
});

export const apiFetch = authFetch.create({
  onRequest: [
    checkConnection,
    ({ options }) => {
      options.signal = options.signal
        ? AbortSignal.any([options.signal, privateRequests.signal])
        : privateRequests.signal;
    },
    withCsrf,
  ],
});

export function httpStatus(error: unknown) {
  return error instanceof FetchError ? (error.statusCode ?? 0) : undefined;
}

function errorDetail(error: unknown): unknown {
  const data: unknown = error instanceof FetchError ? error.data : undefined;
  return data && typeof data === 'object' && 'detail' in data
    ? data.detail
    : undefined;
}

export function validationErrors(error: unknown): Record<string, string> {
  const fields: Record<string, string> = {};
  const detail = errorDetail(error);
  if (!Array.isArray(detail)) return fields;
  for (const issue of detail) {
    if (typeof issue !== 'object' || !issue || !Array.isArray(issue.loc))
      continue;
    const field = String(issue.loc.at(-1));
    fields[field] =
      `${fieldNames[field] ?? 'Поле'}: проверьте введённое значение.`;
  }
  return fields;
}

export function errorMessage(error: unknown) {
  if (error instanceof FetchError) {
    const detail = errorDetail(error);
    const defaults: Record<number, string> = {
      0: networkError,
      401: 'Сессия завершена. Войдите снова.',
      403: 'У вас недостаточно прав для этого действия.',
      404: 'Объект удалён или у вас больше нет к нему доступа.',
      409: 'Данные изменились. Обновите страницу и попробуйте снова.',
      422: 'Проверьте заполнение полей.',
    };
    return (
      (typeof detail === 'string' && details[detail]) ||
      defaults[error.statusCode ?? 0] ||
      'Сервер временно недоступен. Попробуйте ещё раз.'
    );
  }
  return error instanceof Error
    ? error.message
    : 'Не удалось выполнить действие. Попробуйте снова.';
}
