import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import NavMobile from '../components/NavMobile';
import PopupCallback from '../components/PopupCallback';
import PopupSpasibo from '../components/PopupSpasibo';
import PopupPozdr from '../components/PopupPozdr';
import PreLoader from '../components/PreLoader';
import SectionPVid from '../components/ceilingCategory/SectionPVid';
import SectionMinicalc from '../components/sections/SectionMinicalc';
import SectionGalleryCarousel from '../components/ceilingCategory/SectionGalleryCarousel';
import SectionCatalog05 from '../components/ceilingCategory/SectionCatalog05';
import SectionFormLowPrice from '../components/sections/SectionFormLowPrice';
import SectionZamer from '../components/sections/SectionZamer';
import SectionSimpleText from '../components/sections/SectionSimpleText';
import SectionForm5min from '../components/sections/SectionForm5min';
import SectionS25 from '../components/sections/SectionS25';
import SectionS30 from '../components/sections/SectionS30';
import SectionGallery from '../components/sections/SectionGallery';
import SectionReviews from '../components/sections/SectionReviews';
import FooterMenu from '../components/FooterMenu';
import Footer from '../components/Footer';
import { getCeilingCategoryBySlug, CEILING_CATEGORY_SLUGS } from '../data/ceilingCategoriesData';
import {
  siteConfig,
  formLowPriceData,
  zamerBlocks,
  simpleTextQuality,
  form5minData,
  s25Data,
  s30Data,
  galleryData,
  reviewsData,
  footerMenuData,
  footerData,
} from '../data/mockPageData';

export default function CeilingCategoryPage() {
  const [popupCallback, setPopupCallback] = useState(false);
  const [popupSpasibo, setPopupSpasibo] = useState(false);
  const [popupPozdr, setPopupPozdr] = useState(false);
  const [navMobileOpen, setNavMobileOpen] = useState(false);

  const { ceilingCategorySlug } = useParams();
  const category = getCeilingCategoryBySlug(ceilingCategorySlug);

  if (!ceilingCategorySlug || !CEILING_CATEGORY_SLUGS.includes(ceilingCategorySlug) || !category) {
    return <Navigate to="/" replace />;
  }

  const openCallback = () => setPopupCallback(true);
  const closeCallback = () => setPopupCallback(false);
  const onCallbackSuccess = () => setPopupSpasibo(true);
  const phone = siteConfig?.phone || '';

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

      {(category.sections || []).map((section, i) => {
        if (section.type === 'p_vid') {
          return (
            <SectionPVid
              key={i}
              title={section.title}
              intro={section.intro}
              images={section.images}
              rell={section.rell}
            />
          );
        }
        if (section.type === 'minicalc') {
          return (
            <SectionMinicalc
              key={i}
              title="Онлайн расчет стоимости натяжного потолка:"
              label={section.label}
              min={section.min}
              max={section.max}
              value={section.value}
              pricePerM2={section.pricePerM2}
              cenaByType={section.cenaByType}
              phone={phone}
              phoneLabel="Данный расчет представлен для ознакомительных целей. Для получения подробной информации Вы можете связаться с нами по телефону:"
            />
          );
        }
        if (section.type === 'gallery') {
          return <SectionGalleryCarousel key={i} items={section.items} />;
        }
        if (section.type === 'catalog05') {
          return <SectionCatalog05 key={i} title={section.title} rows={section.rows} />;
        }
        return null;
      })}

      <SectionFormLowPrice data={formLowPriceData} />
      <SectionZamer items={zamerBlocks} />
      <SectionSimpleText
        h3={simpleTextQuality.h3}
        paragraphs={simpleTextQuality.paragraphs}
        list={simpleTextQuality.list}
        h2={simpleTextQuality.h2}
        paragraphs2={simpleTextQuality.paragraphs2}
        list2={simpleTextQuality.list2}
      />
      <SectionForm5min data={form5minData} />
      <SectionS25 data={s25Data} />
      <SectionS30 data={s30Data} />
      <SectionGallery items={galleryData} />
      <SectionReviews items={reviewsData} />
      <FooterMenu items={footerMenuData} />
      <Footer data={footerData} />
    </PreLoader>
  );
}
