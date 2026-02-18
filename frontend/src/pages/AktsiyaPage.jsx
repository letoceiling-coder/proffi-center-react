import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Seo, JsonLd, getBaseUrl } from '../seo';
import { breadcrumbList } from '../seo/jsonld';
import { getStaticMeta } from '../seo/routes';
import Header from '../components/Header';
import NavMobile from '../components/NavMobile';
import PopupCallback from '../components/PopupCallback';
import PopupSpasibo from '../components/PopupSpasibo';
import PopupPozdr from '../components/PopupPozdr';
import PreLoader from '../components/PreLoader';
import AktsiyaMarketBlock from '../components/aktsiya/AktsiyaMarketBlock';
import SectionForm5min from '../components/sections/SectionForm5min';
import FooterMenu from '../components/FooterMenu';
import Footer from '../components/Footer';
import { aktsiyaPageData, aktsiyaGifts, aktsiyaForm5minData } from '../data/aktsiyaData';
import { footerMenuData, footerData } from '../data/mockPageData';

export default function AktsiyaPage() {
  const [popupCallback, setPopupCallback] = useState(false);
  const [popupSpasibo, setPopupSpasibo] = useState(false);
  const [popupPozdr, setPopupPozdr] = useState(false);
  const [navMobileOpen, setNavMobileOpen] = useState(false);

  const openCallback = () => setPopupCallback(true);
  const closeCallback = () => setPopupCallback(false);
  const onCallbackSuccess = () => setPopupSpasibo(true);

  useEffect(() => {
    if (window.location.hash !== '#aktsiya') return;
    const el = document.getElementById('aktsiya');
    if (!el) return;
    const t = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#aktsiya') {
        const el = document.getElementById('aktsiya');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <PreLoader>
      <Seo pathname={pathname} />
      <JsonLd scripts={[breadcrumb]} />
      <div className="toptop" />
      <Header onCallClick={openCallback} onZamerClick={openCallback} />
      <NavMobile isOpen={navMobileOpen} onClose={() => setNavMobileOpen(false)} />

      {(popupCallback || popupSpasibo) && (
        <div
          className="hide-layout"
          id="hide-layout"
          style={{ display: 'block', zIndex: 10000 }}
          onClick={() => { closeCallback(); setPopupSpasibo(false); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && (closeCallback(), setPopupSpasibo(false))}
          aria-label="Закрыть"
        />
      )}
      {popupPozdr && (
        <div
          className="hide-layout"
          id="hide-layout_pozdr"
          style={{ display: 'block', zIndex: 10000 }}
          onClick={() => setPopupPozdr(false)}
          role="button"
          tabIndex={0}
          aria-label="Закрыть"
        />
      )}

      <PopupCallback isOpen={popupCallback} onClose={closeCallback} onSuccess={onCallbackSuccess} />
      <PopupSpasibo isOpen={popupSpasibo} onClose={() => setPopupSpasibo(false)} />
      <PopupPozdr isOpen={popupPozdr} onClose={() => setPopupPozdr(false)} onSuccess={onCallbackSuccess} />

      <div className="probel" />

      <section className="section s_market">
        <div className="container">
          <div className="row">
            <div className="col-sm-12 clearfix">
              <h1 className="">{aktsiyaPageData.title}</h1>
              <p className="light">{aktsiyaPageData.intro}</p>
            </div>
          </div>
          <div className="row">
            {aktsiyaGifts.map((item) => (
              <AktsiyaMarketBlock key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <SectionForm5min data={aktsiyaForm5minData} id="aktsiya" />

      <FooterMenu items={footerMenuData} />
      <Footer data={footerData} />
    </PreLoader>
  );
}
