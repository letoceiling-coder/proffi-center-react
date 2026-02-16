import { useState } from 'react';
import Header from '../components/Header';
import NavMobile from '../components/NavMobile';
import PopupCallback from '../components/PopupCallback';
import PopupSpasibo from '../components/PopupSpasibo';
import PopupPozdr from '../components/PopupPozdr';
import PreLoader from '../components/PreLoader';
import SectionRassr from '../components/potolkiVRassrochku/SectionRassr';
import SectionBuyNow from '../components/potolkiVRassrochku/SectionBuyNow';
import SectionFormRassr from '../components/potolkiVRassrochku/SectionFormRassr';
import FooterMenu from '../components/FooterMenu';
import Footer from '../components/Footer';
import { getPotolkiVRassrochkuPageData } from '../data/potolkiVRassrochkuData';
import { siteConfig, footerMenuData, footerData } from '../data/mockPageData';

export default function PotolkiVRassrochkuPage() {
  const [popupCallback, setPopupCallback] = useState(false);
  const [popupSpasibo, setPopupSpasibo] = useState(false);
  const [popupPozdr, setPopupPozdr] = useState(false);
  const [navMobileOpen, setNavMobileOpen] = useState(false);

  const openCallback = () => setPopupCallback(true);
  const closeCallback = () => setPopupCallback(false);
  const onCallbackSuccess = () => setPopupSpasibo(true);

  const pageData = getPotolkiVRassrochkuPageData(siteConfig);

  const handleFormRassrSubmit = () => {
    onCallbackSuccess();
  };

  return (
    <PreLoader>
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

      <SectionRassr data={pageData.rassr} />
      <SectionBuyNow data={pageData.buyNow} />
      <SectionFormRassr data={pageData.formRassr} onSubmit={handleFormRassrSubmit} />

      <FooterMenu items={footerMenuData} />
      <Footer data={footerData} />
    </PreLoader>
  );
}
