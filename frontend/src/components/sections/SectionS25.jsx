import { useSite } from '../../context/SiteContext.jsx';
import { formatPhoneDisplay, formatPhoneHref } from '../../utils/phoneFormat.js';
import { siteConfig } from '../../data/mockPageData';

export default function SectionS25({ data }) {
  const { contacts } = useSite();
  // Телефон по региону (как в шапке и футере), fallback — из data/siteConfig
  const rawPhone = contacts?.phone ?? data?.phone ?? siteConfig.phone;
  const displayPhone = rawPhone ? formatPhoneDisplay(rawPhone) : (data?.phone || siteConfig.phone || '');
  const phoneHref = rawPhone ? formatPhoneHref(rawPhone) : (data?.phone ? formatPhoneHref(data.phone) : '');
  if (!data) return null;
  const { title, columns, subtitle, phoneLabel } = data;

  return (
    <div className="section s25">
      <div className="content">
        <div className="black ttl">
          <span>{title}</span>
        </div>
        <div className="grafic">
          {columns?.map((col, i) => (
            <div key={i} className={`col ${col.class}`}>
              <div className="internal">
                <div className={col.highlight ? 'numbers_y' : 'numbers'}>{col.value}</div>
                <div className={`cell ${col.class.replace('col', 'c')}`} />
              </div>
            </div>
          ))}
          <div className="s_grafic">{subtitle}</div>
        </div>
        <div className="y_tel">
          <p>
            {phoneLabel}<br />
            <span>Звоните: <a style={{ textDecoration: 'none', color: '#333' }} className="comagic_phone" href={phoneHref ? `tel:${phoneHref}` : '#'} itemProp="telephone">{displayPhone}</a></span>
          </p>
        </div>
      </div>
    </div>
  );
}
