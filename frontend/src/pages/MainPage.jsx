import { useState } from 'react';
import { useSite } from '../context/SiteContext.jsx';
import { Seo, JsonLd, getBaseUrl } from '../seo';
import { organization, webSite } from '../seo/jsonld';
import Header from '../components/Header';
import NavMobile from '../components/NavMobile';
import PopupCallback from '../components/PopupCallback';
import PopupSpasibo from '../components/PopupSpasibo';
import PopupPozdr from '../components/PopupPozdr';
import PreLoader from '../components/PreLoader';
import SectionBanner from '../components/sections/SectionBanner';
import SectionDolyamiInformer from '../components/dolyami/SectionDolyamiInformer';
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
import { getRegionPrepositional } from '../utils/regionDisplay.js';
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
  bannerData as defaultBannerData,
} from '../data/mockPageData';

function buildIntroContent(cityPrepositional, regionDisplay) {
  const city = cityPrepositional || 'Анапе';
  const region = regionDisplay || 'Анапском районе';
  return {
    h1: `Натяжные потолки в ${city}`,
    content: `«Proffi Center» – это компания, которая устанавливает натяжные потолки в ${city} с 2013 года! Собственное производство позволяет обеспечить выгодные условия покупки по самым низким ценам. Использование только лучших материалов, комплектующих и профессиональный монтаж потолков гарантируют высокое качество предоставляемых услуг и срок службы более 20 лет!

Основанная в 2013 году компания Proffi Center осуществляет деятельность в сфере ремонтно-отделочных работ вот уже более 13 лет. Ключевым направлением организации является установка натяжных потолков в ${city} и ${region}, услуги по дополнительным работам, розничная и оптовая продажа сопутствующих материалов. Постоянно развиваясь, улучшая обслуживание и качество на всех этапах работ, мы готовы Вам предложить лучшие варианты стилистической концепции, оптимальные отделочные материалы для Вашего помещения, монтаж натяжных потолков с гарантией качества и самой доступной ценой в ${city} и ${region}. Используемый нами материал соответствует всем санитарным требованиям, правилам пожарной безопасности, безопасен для здоровья человека и имеет все необходимые сертификаты. Собственное производство позволяет минимизировать издержки, тем самым гарантировать самые привлекательные цены. Натяжные потолки напрямую от производителя всегда дешевле!`,
  };
}

export default function MainPage() {
  const { site, seoSettings, isLoading } = useSite();
  const [popupCallback, setPopupCallback] = useState(false);
  const [popupSpasibo, setPopupSpasibo] = useState(false);
  const [popupPozdr, setPopupPozdr] = useState(false);
  const [navMobileOpen, setNavMobileOpen] = useState(false);

  const cityName = site?.city?.name;
  const cityPrepositional = site?.city?.name_prepositional ?? cityName ?? 'Анапе';
  const regionName = site?.region?.name;
  const regionDisplay = getRegionPrepositional(regionName) || regionName || 'Анапском районе';
  /** Пока сайт не загружен — не показываем город в контенте (избегаем «Анапа» на поддомене Москвы) */
  const introData = isLoading
    ? { h1: 'Натяжные потолки', content: null }
    : (site?.city
      ? buildIntroContent(cityPrepositional, regionDisplay)
      : { h1: simpleTextIntro.h1, content: simpleTextIntro.content });
  /** Баннер: «За» статично, не привязано к городу */
  const bannerData = site?.city
    ? { ...defaultBannerData, title: 'Натяжной потолок', titleSuffix: 'за' }
    : defaultBannerData;

  const pageTitle = cityName
    ? `Натяжные потолки в ${cityName} — Proffi Center`
    : (seoSettings?.default_title_suffix ? `Натяжные потолки${seoSettings.default_title_suffix}` : null);

  const openCallback = () => {
    setPopupCallback(true);
  };

  const closeCallback = () => {
    setPopupCallback(false);
  };

  const onCallbackSuccess = () => {
    setPopupSpasibo(true);
  };

  const baseUrl = getBaseUrl();
  const siteName = seoSettings?.site_name || site?.name || 'Proffi Center';

  return (
    <PreLoader>
      <Seo pathname="/" title={pageTitle || undefined} siteName={siteName} />
      <JsonLd scripts={[organization(baseUrl, { name: siteName, phone: site?.contacts?.[0]?.phone, email: site?.contacts?.[0]?.email }), webSite(baseUrl, siteName)]} />
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

      <SectionBanner data={bannerData} onZamerClick={openCallback} />
      <SectionDolyamiInformer />
      <SectionSimpleText h1={introData.h1} content={introData.content} />

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
