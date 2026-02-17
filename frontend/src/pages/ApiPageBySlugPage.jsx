import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FooterMenu from '../components/FooterMenu';
import BlockRenderer from '../components/blocks/BlockRenderer';
import ContentMeta from '../components/ContentMeta';
import PreLoader from '../components/PreLoader';
import { getPage } from '../api/public.js';

export default function ApiPageBySlugPage() {
  const { slug } = useParams();
  const [state, setState] = useState({ data: null, meta: null, loading: true, error: null });

  useEffect(() => {
    if (!slug) {
      setState((s) => ({ ...s, loading: false, error: 'missing-slug' }));
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    getPage(slug)
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
        <div className="section"><div className="container"><h1>Страница не найдена</h1></div></div>
        <Footer />
      </PreLoader>
    );
  }

  const { title, blocks = [], media } = state.data;
  const seo = state.meta?.seo;

  return (
    <PreLoader>
      <ContentMeta meta={state.meta} />
      <Header />
      <main className="content-by-slug">
        {seo?.h1 && <div className="section"><div className="container"><h1>{seo.h1}</h1></div></div>}
        {!seo?.h1 && title && <div className="section"><div className="container"><h1>{title}</h1></div></div>}
        {media?.cover?.url && (
          <div className="section">
            <div className="container">
              <img src={media.cover.url} alt={media.cover.alt || title} style={{ maxWidth: '100%' }} />
            </div>
          </div>
        )}
        <BlockRenderer blocks={blocks} entityMedia={media} />
      </main>
      <FooterMenu />
      <Footer />
    </PreLoader>
  );
}
