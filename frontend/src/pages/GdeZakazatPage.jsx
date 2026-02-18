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
import SectionContacts from '../components/sections/SectionContacts';
import SectionForm5min from '../components/sections/SectionForm5min';
import SectionZamer from '../components/sections/SectionZamer';
import FooterMenu from '../components/FooterMenu';
import Footer from '../components/Footer';
import { useSite } from '../context/SiteContext.jsx';
import { getGdeZakazatPageData } from '../data/gdeZakazatData';
import {
  siteConfig,
  zamerBlocks,
  form5minData,
  footerMenuData,
  footerData,
} from '../data/mockPageData';

export default function GdeZakazatPage() {
  const { site, contacts } = useSite();
  const [popupCallback, setPopupCallback] = useState(false);
  const [popupSpasibo, setPopupSpasibo] = useState(false);
  const [popupPozdr, setPopupPozdr] = useState(false);
  const [navMobileOpen, setNavMobileOpen] = useState(false);

  const openCallback = () => setPopupCallback(true);
  const closeCallback = () => setPopupCallback(false);
  const onCallbackSuccess = () => setPopupSpasibo(true);
  const pathname = useLocation().pathname;
  const staticMeta = getStaticMeta(pathname);
  const breadcrumb = breadcrumbList(getBaseUrl(), [{ name: 'Главная', url: '/' }, { name: staticMeta?.title?.replace(' — Proffi Center', '') || 'Где заказать' }]);

  /** Для городских сайтов не подставляем почтовый индекс другого города */
  const postalForSite = site?.city
    ? (contacts?.address_postal_code ?? '')
    : (contacts?.address_postal_code ?? siteConfig.address.postalCode);

  const contactsConfig = useMemo(() => {
    if (!site && !contacts) return siteConfig;
    return {
      ...siteConfig,
      address: contacts
        ? {
            locality: contacts.address_locality ?? siteConfig.address.locality,
            street: contacts.address_street ?? siteConfig.address.street,
            postalCode: postalForSite,
          }
        : siteConfig.address,
      city: site?.city?.name ?? siteConfig.city,
      region: site?.region?.name ?? '',
      workTime: contacts?.work_time ?? siteConfig.workTime,
      phone: contacts?.phone ?? siteConfig.phone,
      companyName: contacts?.company_name ?? siteConfig.companyName,
    };
  }, [site, contacts, postalForSite]);

  const pageData = getGdeZakazatPageData(contactsConfig);
  const addressForSchema = contacts
    ? {
        locality: contacts.address_locality ?? siteConfig.address.locality,
        street: contacts.address_street ?? siteConfig.address.street,
        postalCode: postalForSite,
      }
    : siteConfig.address;

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

      <SectionContacts
        contacts={pageData.contacts}
        mapAddress={pageData.mapAddress}
        mapPhone={pageData.mapPhone}
        mapMarker={pageData.mapMarker}
        address={siteConfig.address}
      />
      <SectionForm5min data={form5minData} />
      <SectionZamer items={zamerBlocks} />

      <FooterMenu items={footerMenuData} />
      <Footer data={footerData} />
    </PreLoader>
  );
}
