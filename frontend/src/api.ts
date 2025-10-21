export interface Article {
  id: number;
  title: string;
  slug: string;
  body: string;
  published: boolean;
  published_at?: string | null;
  author_id: number;
  created_at: string;
  updated_at: string;
}

export interface CursorPage<T> {
  items: T[];
  next_cursor?: string | null;
  has_more: boolean;
}

type QueryParams = Record<string, string | undefined | null>;

const DEFAULT_API_BASE_URL = 'http://localhost:8080';
const rawBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? DEFAULT_API_BASE_URL;
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const baseForUrl = `${normalizedBaseUrl}/`;

export const apiBaseUrl = normalizedBaseUrl;

function buildUrl(path: string, params?: QueryParams): URL {
  const url = new URL(path.startsWith('/') ? path : `/${path}`, baseForUrl);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }
  return url;
}

async function request<T>(path: string, params?: QueryParams): Promise<T> {
  const url = buildUrl(path, params);
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  });

  const text = await response.text();
  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`.trim();
    if (text) {
      try {
        const parsed = JSON.parse(text) as { message?: string; error?: string };
        message = parsed.message ?? parsed.error ?? message;
      } catch {
        message = text;
      }
    }
    throw new Error(message || 'Request failed');
  }

  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

export interface FetchArticlesParams {
  cursor?: string | null;
  query?: string;
  includeDrafts?: boolean;
}

export async function fetchArticles(params: FetchArticlesParams = {}): Promise<CursorPage<Article>> {
  const queryParams: QueryParams = {
    cursor: params.cursor ?? undefined,
    q: params.query ?? undefined,
    include_drafts: params.includeDrafts ? 'true' : undefined,
  };

  return request<CursorPage<Article>>('/api/v1/articles', queryParams);
}

export async function fetchArticleBySlug(slug: string): Promise<Article> {
  return request<Article>(`/api/v1/articles/by-slug/${encodeURIComponent(slug)}`);
}
