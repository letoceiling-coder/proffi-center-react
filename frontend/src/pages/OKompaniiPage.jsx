import { useState, useMemo } from 'react';
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
import SectionAbout from '../components/okompanii/SectionAbout';
import SectionZakazalo from '../components/okompanii/SectionZakazalo';
import SectionReviews from '../components/sections/SectionReviews';
import SectionGallery from '../components/sections/SectionGallery';
import FooterMenu from '../components/FooterMenu';
import Footer from '../components/Footer';
import { useSite } from '../context/SiteContext.jsx';
import { getRegionPrepositional } from '../utils/regionDisplay.js';
import { oKompaniiPageData, oKompaniiAboutCarousel, oKompaniiZakazaloData } from '../data/oKompaniiData';
import { reviewsData, galleryData, footerMenuData, footerData } from '../data/mockPageData';

function buildOKompaniiParagraphs(cityPrepositional, regionDisplay) {
  const city = cityPrepositional || 'Анапе';
  const region = regionDisplay || 'Анапском районе';
  return [
    `«Proffi Center» – это компания, которая устанавливает натяжные потолки в ${city} с 2013 года! Собственное производство позволяет обеспечить выгодные условия покупки по самым низким ценам. Использование только лучших материалов, комплектующих и профессиональный монтаж потолков гарантируют высокое качество предоставляемых услуг и срок службы более 20 лет!`,
    `Основанная в 2013 году компания Proffi Center осуществляет деятельность в сфере ремонтно-отделочных работ вот уже более 13 лет. Ключевым направлением организации является установка натяжных потолков в ${city} и ${region}, услуги по дополнительным работам, розничная и оптовая продажа сопутствующих материалов. Постоянно развиваясь, улучшая обслуживание и качество на всех этапах работ, мы готовы Вам предложить лучшие варианты стилистической концепции, оптимальные отделочные материалы для Вашего помещения, монтаж натяжных потолков с гарантией качества и самой доступной ценой в ${city} и ${region}. Используемый нами материал соответствует всем санитарным требованиям, правилам пожарной безопасности, безопасен для здоровья человека и имеет все необходимые сертификаты. Собственное производство позволяет минимизировать издержки, тем самым гарантировать самые привлекательные цены. Натяжные потолки напрямую от производителя всегда дешевле!`,
  ];
}

export default function OKompaniiPage() {
  const { site } = useSite();
  const [popupCallback, setPopupCallback] = useState(false);
  const [popupSpasibo, setPopupSpasibo] = useState(false);
  const [popupPozdr, setPopupPozdr] = useState(false);
  const [navMobileOpen, setNavMobileOpen] = useState(false);

  const cityPrepositional = site?.city?.name_prepositional ?? site?.city?.name ?? 'Анапе';
  const regionDisplay = getRegionPrepositional(site?.region?.name) || site?.region?.name || 'Анапском районе';
  const pageData = useMemo(
    () =>
      site?.city
        ? { ...oKompaniiPageData, paragraphs: buildOKompaniiParagraphs(cityPrepositional, regionDisplay) }
        : oKompaniiPageData,
    [site?.city, cityPrepositional, regionDisplay]
  );

  const openCallback = () => setPopupCallback(true);
  const closeCallback = () => setPopupCallback(false);
  const onCallbackSuccess = () => setPopupSpasibo(true);
  const pathname = useLocation().pathname;
  const staticMeta = getStaticMeta(pathname);
  const breadcrumb = breadcrumbList(getBaseUrl(), [{ name: 'Главная', url: '/' }, { name: staticMeta?.title?.replace(' — Proffi Center', '') || 'О компании' }]);

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

      <SectionAbout data={oKompaniiPageData} carouselItems={oKompaniiAboutCarousel} />
      <SectionZakazalo data={oKompaniiZakazaloData} />
      <SectionReviews items={reviewsData} />
      <SectionGallery items={galleryData} />

      <FooterMenu items={footerMenuData} />
      <Footer data={footerData} />
    </PreLoader>
  );
}
