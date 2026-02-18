import { useState } from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext.jsx';
import { formatPhoneDisplay } from '../utils/phoneFormat.js';
import Header from '../components/Header';
import NavMobile from '../components/NavMobile';
import PopupCallback from '../components/PopupCallback';
import PopupSpasibo from '../components/PopupSpasibo';
import PopupPozdr from '../components/PopupPozdr';
import PreLoader from '../components/PreLoader';
import { Seo, JsonLd, getBaseUrl } from '../seo';
import { breadcrumbList } from '../seo/jsonld';
import SectionPVid from '../components/ceilingCategory/SectionPVid';
import SectionSimpleText from '../components/sections/SectionSimpleText';
import SectionMinicalc from '../components/sections/SectionMinicalc';
import SectionFormLowPrice from '../components/sections/SectionFormLowPrice';
import SectionZamer from '../components/sections/SectionZamer';
import SectionForm5min from '../components/sections/SectionForm5min';
import SectionS25 from '../components/sections/SectionS25';
import SectionS30 from '../components/sections/SectionS30';
import SectionGallery from '../components/sections/SectionGallery';
import SectionReviews from '../components/sections/SectionReviews';
import FooterMenu from '../components/FooterMenu';
import Footer from '../components/Footer';
import { getRoomPageBySlug, isRoomPageSlug } from '../data/roomPagesData';
import {
  siteConfig,
  formLowPriceData,
  zamerBlocks,
  simpleTextBlocks,
  form5minData,
  s25Data,
  s30Data,
  galleryData,
  reviewsData,
  footerMenuData,
  footerData,
} from '../data/mockPageData';

export default function RoomPage() {
  const { contacts } = useSite();
  const [popupCallback, setPopupCallback] = useState(false);
  const [popupSpasibo, setPopupSpasibo] = useState(false);
  const [popupPozdr, setPopupPozdr] = useState(false);
  const [navMobileOpen, setNavMobileOpen] = useState(false);

  const { slug: paramSlug } = useParams();
  const location = useLocation();
  const slug = paramSlug || (location.pathname || '').replace(/^\/|\/$/g, '');
  const pageData = getRoomPageBySlug(slug);

  if (!slug || !isRoomPageSlug(slug) || !pageData) {
    return <Navigate to="/" replace />;
  }

  const openCallback = () => setPopupCallback(true);
  const closeCallback = () => setPopupCallback(false);
  const onCallbackSuccess = () => setPopupSpasibo(true);

  const introText = pageData.fullIntro != null ? pageData.fullIntro : pageData.intro;
  const pvidImages = (pageData.introImages && pageData.introImages.length > 0)
    ? pageData.introImages.map((img) => ({ src: img.src, alt: img.alt || img.caption, caption: img.caption, name: img.caption }))
    : (pageData.heroImage ? [{ src: pageData.heroImage, alt: pageData.title, name: pageData.shortTitle }] : []);

  const galleryItems = (pageData.gallery && pageData.gallery.length > 0)
    ? pageData.gallery
    : galleryData;

  const baseUrl = getBaseUrl();
  const breadcrumb = breadcrumbList(baseUrl, [{ name: 'Главная', url: '/' }, { name: pageData.title }]);

  return (
    <PreLoader>
      <Seo title={pageData.meta?.title} description={pageData.meta?.description} pathname={location.pathname} />
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

      {/* Заголовок, текст и фото — как на proffi-center.ru/potolki-v-spalnju */}
      <SectionPVid
        title={pageData.title}
        intro={introText}
        images={pvidImages}
        rell={false}
      />

      {/* Онлайн расчет стоимости (если задан minicalc в данных страницы) */}
      {pageData.minicalc && (
        <SectionMinicalc
          title={pageData.minicalc.title}
          label={pageData.minicalc.label}
          min={pageData.minicalc.min}
          max={pageData.minicalc.max}
          value={pageData.minicalc.value}
          pricePerM2={pageData.minicalc.pricePerM2}
          phone={(contacts?.phone ?? siteConfig.phone) ? formatPhoneDisplay(contacts?.phone ?? siteConfig.phone) : ''}
          phoneLabel={pageData.minicalc.phoneLabel}
        />
      )}

      <SectionFormLowPrice data={formLowPriceData} />
      <SectionZamer items={zamerBlocks} />

      {/* Блоки «Когда и как лучше заказывать...» и «Наши услуги...» — 1 в 1 как на оригинале */}
      {(pageData.textBlocks && pageData.textBlocks.length > 0)
        ? pageData.textBlocks.map((block, i) => (
            <SectionSimpleText key={i} h3={block.h3} paragraphs={block.paragraphs} />
          ))
        : simpleTextBlocks.map((block, i) => (
            <SectionSimpleText key={i} h3={block.h3} paragraphs={block.paragraphs} />
          ))}

      <SectionForm5min data={form5minData} />
      <SectionS25 data={s25Data} />
      <SectionS30 data={s30Data} />
      <SectionReviews items={reviewsData} />
      <SectionGallery items={galleryItems} />
      <FooterMenu items={footerMenuData} />
      <Footer data={footerData} />
    </PreLoader>
  );
}
