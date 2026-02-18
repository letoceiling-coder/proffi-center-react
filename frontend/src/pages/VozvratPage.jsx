import { useState } from 'react';
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
import SectionVozvrat from '../components/vozvrat/SectionVozvrat';
import FooterMenu from '../components/FooterMenu';
import Footer from '../components/Footer';
import { getVozvratPageData } from '../data/vozvratData';
import { siteConfig, footerMenuData, footerData } from '../data/mockPageData';

export default function VozvratPage() {
  const [popupCallback, setPopupCallback] = useState(false);
  const [popupSpasibo, setPopupSpasibo] = useState(false);
  const [popupPozdr, setPopupPozdr] = useState(false);
  const [navMobileOpen, setNavMobileOpen] = useState(false);

  const openCallback = () => setPopupCallback(true);
  const closeCallback = () => setPopupCallback(false);
  const onCallbackSuccess = () => setPopupSpasibo(true);

  const pageData = getVozvratPageData(siteConfig);
  const pathname = useLocation().pathname;
  const staticMeta = getStaticMeta(pathname);
  const breadcrumb = breadcrumbList(getBaseUrl(), [{ name: 'Главная', url: '/' }, { name: staticMeta?.title?.replace(' — Proffi Center', '') || 'Возврат' }]);

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

      <SectionVozvrat data={pageData} />

      <FooterMenu items={footerMenuData} />
      <Footer data={footerData} />
    </PreLoader>
  );
}
