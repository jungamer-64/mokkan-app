import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';
import type { Article } from './api';
import { apiBaseUrl, fetchArticleBySlug, fetchArticles } from './api';

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const createExcerpt = (body: string) => {
  const normalized = body.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return '本文がまだありません。';
  }
  return normalized.length > 140 ? `${normalized.slice(0, 140)}…` : normalized;
};

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchArticles({ query })
      .then((page) => {
        if (cancelled) {
          return;
        }
        setArticles(page.items);
        setNextCursor(page.next_cursor ?? null);
      })
      .catch((err: Error) => {
        if (cancelled) {
          return;
        }
        setError(err.message || '記事の取得に失敗しました。');
        setArticles([]);
        setNextCursor(null);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  useEffect(() => {
    if (!articles.length) {
      setSelectedArticle(null);
      return;
    }

    setSelectedArticle((current) => {
      if (current && articles.some((item) => item.id === current.id)) {
        return current;
      }
      return articles[0];
    });
  }, [articles]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    setQuery(trimmed ? trimmed : undefined);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setQuery(undefined);
  };

  const loadMore = async () => {
    if (!nextCursor || loadingMore) {
      return;
    }

    setLoadingMore(true);
    setError(null);

    try {
      const page = await fetchArticles({ cursor: nextCursor, query });
      setArticles((current) => [...current, ...page.items]);
      setNextCursor(page.next_cursor ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : '追加の読み込みに失敗しました。';
      setError(message);
    } finally {
      setLoadingMore(false);
    }
  };

  const refreshArticle = async (slug: string) => {
    setDetailError(null);
    try {
      const fresh = await fetchArticleBySlug(slug);
      setSelectedArticle(fresh);
      setArticles((current) =>
        current.map((item) => (item.slug === fresh.slug ? fresh : item)),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '記事の詳細取得に失敗しました。';
      setDetailError(message);
    }
  };

  const articleCountLabel = useMemo(() => {
    if (loading) {
      return '読み込み中...';
    }
    if (!articles.length) {
      return '記事が見つかりませんでした。';
    }
    return `${articles.length}件の記事`;
  }, [articles.length, loading]);

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Rust CMS ダッシュボード</h1>
          <p className="app__subtitle">
            既存のバックエンド API に接続し、記事の一覧と内容を確認できます。
          </p>
        </div>
        <div className="app__connection">
          <span className="app__connection-label">接続先:</span>
          <code className="app__connection-value">{apiBaseUrl}</code>
        </div>
      </header>

      <main className="app__content">
        <section className="app__sidebar">
          <form className="search" onSubmit={handleSearchSubmit}>
            <label className="search__label" htmlFor="search-input">
              記事を検索
            </label>
            <div className="search__controls">
              <input
                id="search-input"
                className="search__input"
                type="search"
                placeholder="タイトルや本文をキーワードで検索"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                autoComplete="off"
              />
              <button type="submit" className="button button--primary">
                検索
              </button>
              <button
                type="button"
                className="button"
                onClick={handleClearSearch}
                disabled={!query && !searchInput}
              >
                クリア
              </button>
            </div>
          </form>

          <div className="status-bar">
            <span>{articleCountLabel}</span>
            {nextCursor && (
              <span className="status-bar__hint">さらに読み込める記事があります。</span>
            )}
          </div>

          {error && <div className="notice notice--error">{error}</div>}

          <ul className="article-list">
            {articles.map((article) => {
              const isSelected = selectedArticle?.id === article.id;
              return (
                <li key={article.id} className={`article-card${isSelected ? ' is-selected' : ''}`}>
                  <button
                    type="button"
                    className="article-card__button"
                    onClick={() => {
                      setDetailError(null);
                      setSelectedArticle(article);
                    }}
                  >
                    <div className="article-card__header">
                      <h3 className="article-card__title">{article.title}</h3>
                      {!article.published && <span className="badge">下書き</span>}
                    </div>
                    <p className="article-card__meta">
                      更新: {formatDateTime(article.updated_at)}
                    </p>
                    <p className="article-card__excerpt">{createExcerpt(article.body)}</p>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="sidebar__actions">
            {nextCursor ? (
              <button
                type="button"
                className="button button--secondary"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? '読み込み中...' : 'もっと読み込む'}
              </button>
            ) : (
              <span className="status-bar__hint">すべての記事を表示しています。</span>
            )}
          </div>
        </section>

        <section className="app__detail">
          {selectedArticle ? (
            <article className="article-detail">
              <header className="article-detail__header">
                <div>
                  <h2 className="article-detail__title">{selectedArticle.title}</h2>
                  <div className="article-detail__meta">
                    <span>作成: {formatDateTime(selectedArticle.created_at)}</span>
                    <span>更新: {formatDateTime(selectedArticle.updated_at)}</span>
                    <span>
                      状態:{' '}
                      {selectedArticle.published
                        ? `公開中 (${selectedArticle.published_at ? formatDateTime(selectedArticle.published_at) : '日時不明'})`
                        : '下書き'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="button button--outline"
                  onClick={() => refreshArticle(selectedArticle.slug)}
                >
                  最新の情報を取得
                </button>
              </header>

              {detailError && <div className="notice notice--error">{detailError}</div>}

              <div className="article-detail__body">
                {selectedArticle.body
                  .split(/\n{2,}/)
                  .map((block, index) => (
                    <p key={index} className="article-detail__paragraph">
                      {block}
                    </p>
                  ))}
              </div>
            </article>
          ) : (
            <div className="article-detail__placeholder">
              {loading ? '記事を読み込んでいます...' : '左の一覧から記事を選択してください。'}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
