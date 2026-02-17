import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FooterMenu from '../components/FooterMenu';
import ContentMeta from '../components/ContentMeta';
import PreLoader from '../components/PreLoader';
import { getProductCategory } from '../api/public.js';

export default function ApiProductCategoryPage({ slugOverride = null }) {
  const { slug: slugParam } = useParams();
  const slug = slugOverride ?? slugParam;
  const [state, setState] = useState({ data: null, meta: null, loading: true, error: null });

  useEffect(() => {
    if (!slug) {
      setState((s) => ({ ...s, loading: false, error: 'missing-slug' }));
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    getProductCategory(slug)
      .then((res) => {
        if (cancelled) return;
        setState({ data: res?.data, meta: res?.meta, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ data: null, meta: null, loading: false, error: err?.status === 404 ? 'not-found' : err?.message });
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (state.loading) {
    return (
      <PreLoader>
        <Header />
        <div className="section"><div className="container"><p>Загрузка...</p></div></div>
        <Footer />
      </PreLoader>
    );
  }

  if (state.error === 'not-found' || !state.data) {
    return (
      <PreLoader>
        <Header />
        <div className="section"><div className="container"><h1>Категория не найдена</h1></div></div>
        <Footer />
      </PreLoader>
    );
  }

  const { title, media } = state.data;

  return (
    <PreLoader>
      <ContentMeta meta={state.meta} />
      <Header />
      <main className="content-by-slug">
        <div className="section"><div className="container"><h1>{state.meta?.seo?.h1 || title}</h1></div></div>
        {media?.cover?.url && (
          <div className="section">
            <div className="container">
              <img src={media.cover.url} alt={media.cover.alt || title} style={{ maxWidth: '100%' }} />
            </div>
          </div>
        )}
        <div className="section"><div className="container"><p>Каталог: {title}</p></div></div>
      </main>
      <FooterMenu />
      <Footer />
    </PreLoader>
  );
}
