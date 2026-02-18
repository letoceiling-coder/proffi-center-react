import { useState } from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext.jsx';
import { Seo, JsonLd, getBaseUrl } from '../seo';
import { breadcrumbList } from '../seo/jsonld';
import Header from '../components/Header';
import NavMobile from '../components/NavMobile';
import PopupCallback from '../components/PopupCallback';
import PopupSpasibo from '../components/PopupSpasibo';
import PopupPozdr from '../components/PopupPozdr';
import PreLoader from '../components/PreLoader';
import SectionProductHero from '../components/sections/SectionProductHero';
import SectionMinicalc from '../components/sections/SectionMinicalc';
import SectionFormLowPrice from '../components/sections/SectionFormLowPrice';
import SectionZamer from '../components/sections/SectionZamer';
import SectionMaterials from '../components/sections/SectionMaterials';
import SectionForm5min from '../components/sections/SectionForm5min';
import SectionS25 from '../components/sections/SectionS25';
import SectionS30 from '../components/sections/SectionS30';
import SectionGallery from '../components/sections/SectionGallery';
import SectionReviews from '../components/sections/SectionReviews';
import FooterMenu from '../components/FooterMenu';
import Footer from '../components/Footer';
import { getProductBySlug } from '../data/productDetailData';
import { footerMenuData, footerData, siteConfig } from '../data/mockPageData';

export default function ProductDetailPage() {
  const { contacts } = useSite();
  const [popupCallback, setPopupCallback] = useState(false);
  const [popupSpasibo, setPopupSpasibo] = useState(false);
  const [popupPozdr, setPopupPozdr] = useState(false);
  const [navMobileOpen, setNavMobileOpen] = useState(false);

  const { productSlug } = useParams();
  const product = getProductBySlug(productSlug);

  if (!product) {
    return <Navigate to="/" replace />;
  }

  const openCallback = () => setPopupCallback(true);
  const closeCallback = () => setPopupCallback(false);
  const onCallbackSuccess = () => setPopupSpasibo(true);

  const handleLowPriceSubmit = () => { /* TODO: API */ };
  const handleForm5minSubmit = () => { /* TODO: API */ };
  const pathname = useLocation().pathname;
  const baseUrl = getBaseUrl();
  const breadcrumb = breadcrumbList(baseUrl, [{ name: 'Главная', url: '/' }, { name: 'Готовые потолки', url: '/gotovye-potolki' }, { name: product.title }]);

  return (
    <PreLoader>
      <Seo pathname={pathname} title={product.title + ' — Proffi Center'} description={product.subtitle || undefined} />
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

      <SectionProductHero title={product.title} subtitle={product.subtitle} />
      <SectionMinicalc
        title={product.calcTitle}
        label={product.calcLabel}
        min={product.calcMin}
        max={product.calcMax}
        pricePerM2={product.pricePerM2}
        phone={(contacts?.phone ?? siteConfig.phone) ? formatPhoneDisplay(contacts?.phone ?? siteConfig.phone) : ''}
      />
      <SectionFormLowPrice data={product.formLowPrice} onSubmit={handleLowPriceSubmit} />
      <SectionZamer items={product.zamer} />
      <SectionMaterials
        title={product.materials?.title}
        images={product.materials?.images}
        text={product.materials?.text}
        linksIntro={product.materials?.linksIntro}
        links={product.materials?.links}
      />
      <SectionForm5min data={product.form5min} onSubmit={handleForm5minSubmit} />
      <SectionS25 data={product.s25} />
      <SectionS30 data={product.s30} />
      <SectionGallery items={product.gallery} />
      <SectionReviews items={product.reviews} />

      <FooterMenu items={footerMenuData} />
      <Footer data={footerData} />
    </PreLoader>
  );
}
