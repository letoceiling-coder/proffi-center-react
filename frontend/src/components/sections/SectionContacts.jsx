import { useEffect, useRef } from 'react';
import { initYandexMap, destroyYandexMap } from '../../utils/yandexMap';

/**
 * Секция контактов: заголовок, режим работы, блок карты, «Позвоните нам».
 * Разметка и классы — как в шаблоне gde-zakazat-potolki.html.
 * Карта Яндекс инициализируется по адресу из регионального конфига.
 */

const MAP_CONTAINER_ID = 'map';

export default function SectionContacts({ contacts = {}, mapAddress = '', mapPhone = {}, mapMarker = {}, address = {} }) {
  const mapRef = useRef(null);
  const h1Lines = (contacts.h1 || '').split('\n').filter(Boolean);
  const workTimeLines = (contacts.workTime || '').split('\n').filter(Boolean);

  useEffect(() => {
    if (!mapAddress) return;
    let mounted = true;
    initYandexMap(MAP_CONTAINER_ID, mapAddress, mapMarker).then((map) => {
      if (mounted) mapRef.current = map;
    });
    return () => {
      mounted = false;
      destroyYandexMap(mapRef.current);
      mapRef.current = null;
    };
  }, [mapAddress]);

  return (
    <>
      <div className="section s_contacts">
        <div className="container" itemProp="address" itemScope itemType="http://schema.org/PostalAddress">
          {address?.locality && <meta itemProp="addressLocality" content={address.locality} />}
          {address?.street && <meta itemProp="streetAddress" content={address.street} />}
          {address?.postalCode && <meta itemProp="postalCode" content={address.postalCode} />}
          <div className="row">
            <div className="col-sm-12 clearfix">
              <div className="col-sm-7 clearfix">
                <div className="c_adr">
                  <h1 itemProp="name" className="h1">
                    {h1Lines.map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < h1Lines.length - 1 && <br />}
                      </span>
                    ))}
                  </h1>
                </div>
              </div>
              <div className="col-sm-5 clearfix">
                <div className="c_time">
                  {workTimeLines.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < workTimeLines.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <br />
        </div>
      </div>

      <div
        id={MAP_CONTAINER_ID}
        data-town={mapAddress || undefined}
        data-address={mapMarker.address || undefined}
        data-phone={mapMarker.phone || undefined}
        data-work-time={mapMarker.workTime || undefined}
        data-company-name={mapMarker.companyName || undefined}
      />

      <div className="section">
        <div className="container">
          <div className="row">
            <div className="map-phone">
              {mapPhone.text}{' '}
              {mapPhone.phone && (
                <a className="comagic_phone" href={`tel:${mapPhone.phone.replace(/\s/g, '')}`} style={{ textDecoration: 'none' }}>
                  {mapPhone.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
