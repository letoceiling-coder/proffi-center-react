import { useState } from 'react';
import Header from '../components/Header';
import NavMobile from '../components/NavMobile';
import PopupCallback from '../components/PopupCallback';
import PopupSpasibo from '../components/PopupSpasibo';
import PopupPozdr from '../components/PopupPozdr';
import PreLoader from '../components/PreLoader';
import SectionAbout from '../components/okompanii/SectionAbout';
import SectionZakazalo from '../components/okompanii/SectionZakazalo';
import SectionReviews from '../components/sections/SectionReviews';
import SectionGallery from '../components/sections/SectionGallery';
import FooterMenu from '../components/FooterMenu';
import Footer from '../components/Footer';
import { oKompaniiPageData, oKompaniiAboutCarousel, oKompaniiZakazaloData } from '../data/oKompaniiData';
import { reviewsData, galleryData, footerMenuData, footerData } from '../data/mockPageData';

export default function OKompaniiPage() {
  const [popupCallback, setPopupCallback] = useState(false);
  const [popupSpasibo, setPopupSpasibo] = useState(false);
  const [popupPozdr, setPopupPozdr] = useState(false);
  const [navMobileOpen, setNavMobileOpen] = useState(false);

  const openCallback = () => setPopupCallback(true);
  const closeCallback = () => setPopupCallback(false);
  const onCallbackSuccess = () => setPopupSpasibo(true);

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

      <SectionAbout data={oKompaniiPageData} carouselItems={oKompaniiAboutCarousel} />
      <SectionZakazalo data={oKompaniiZakazaloData} />
      <SectionReviews items={reviewsData} />
      <SectionGallery items={galleryData} />

      <FooterMenu items={footerMenuData} />
      <Footer data={footerData} />
    </PreLoader>
  );
}
