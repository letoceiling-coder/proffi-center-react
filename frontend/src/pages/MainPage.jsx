import { useState } from 'react';
import Header from '../components/Header';
import NavMobile from '../components/NavMobile';
import PopupCallback from '../components/PopupCallback';
import PopupSpasibo from '../components/PopupSpasibo';
import PopupPozdr from '../components/PopupPozdr';
import PreLoader from '../components/PreLoader';
import SectionBanner from '../components/sections/SectionBanner';
import SectionSimpleText from '../components/sections/SectionSimpleText';
import SectionLinks from '../components/sections/SectionLinks';
import SectionFormLowPrice from '../components/sections/SectionFormLowPrice';
import SectionZamer from '../components/sections/SectionZamer';
import SectionPrTable from '../components/sections/SectionPrTable';
import SectionPotolki2 from '../components/sections/SectionPotolki2';
import SectionForm5min from '../components/sections/SectionForm5min';
import SectionS25 from '../components/sections/SectionS25';
import SectionS30 from '../components/sections/SectionS30';
import SectionGallery from '../components/sections/SectionGallery';
import SectionReviews from '../components/sections/SectionReviews';
import FooterMenu from '../components/FooterMenu';
import Footer from '../components/Footer';
import {
  simpleTextIntro,
  simpleTextBlocks,
  simpleTextQuality,
  linkBlocks,
  formLowPriceData,
  zamerBlocks,
  prTableData,
  potolki2Data,
  form5minData,
  s25Data,
  s30Data,
  galleryData,
  reviewsData,
  footerMenuData,
  footerData,
} from '../data/mockPageData';

export default function MainPage() {
  const [popupCallback, setPopupCallback] = useState(false);
  const [popupSpasibo, setPopupSpasibo] = useState(false);
  const [popupPozdr, setPopupPozdr] = useState(false);
  const [navMobileOpen, setNavMobileOpen] = useState(false);

  const openCallback = () => {
    setPopupCallback(true);
  };

  const closeCallback = () => {
    setPopupCallback(false);
  };

  const onCallbackSuccess = () => {
    setPopupSpasibo(true);
  };

  return (
    <PreLoader>
      <div className="toptop" />
      <Header onCallClick={openCallback} onZamerClick={openCallback} />

      <NavMobile isOpen={navMobileOpen} onClose={() => setNavMobileOpen(false)} />

      {/* Оверлей затемнения — рендерим первым (ниже по стеку), z-index выше .img-full (9999), чтобы затемнение было видно */}
      {(popupCallback || popupSpasibo) && (
        <div className="hide-layout" id="hide-layout" style={{ display: 'block', zIndex: 10000 }} onClick={() => { closeCallback(); setPopupSpasibo(false); }} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && (closeCallback(), setPopupSpasibo(false))} aria-label="Закрыть" />
      )}
      {popupPozdr && (
        <div className="hide-layout" id="hide-layout_pozdr" style={{ display: 'block', zIndex: 10000 }} onClick={() => setPopupPozdr(false)} role="button" tabIndex={0} aria-label="Закрыть" />
      )}

      <PopupCallback
        isOpen={popupCallback}
        onClose={closeCallback}
        onSuccess={onCallbackSuccess}
      />
      <PopupSpasibo isOpen={popupSpasibo} onClose={() => setPopupSpasibo(false)} />
      <PopupPozdr
        isOpen={popupPozdr}
        onClose={() => setPopupPozdr(false)}
        onSuccess={onCallbackSuccess}
      />

      <div className="probel" />

      <SectionBanner onZamerClick={openCallback} />
      <SectionSimpleText h1={simpleTextIntro.h1} content={simpleTextIntro.content} />

      <SectionLinks items={linkBlocks} />

      {simpleTextBlocks.map((block, i) => (
        <SectionSimpleText key={i} h3={block.h3} paragraphs={block.paragraphs} />
      ))}

      <SectionFormLowPrice data={formLowPriceData} />

      <SectionSimpleText
        h3={simpleTextQuality.h3}
        paragraphs={simpleTextQuality.paragraphs}
        list={simpleTextQuality.list}
        h2={simpleTextQuality.h2}
        paragraphs2={simpleTextQuality.paragraphs2}
        list2={simpleTextQuality.list2}
      />

      <SectionZamer items={zamerBlocks} />
      <SectionPrTable data={prTableData} />
      <SectionPotolki2 items={potolki2Data} />
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
