import { siteConfig } from '../../data/mockPageData';

export default function SectionS25({ data }) {
  if (!data) return null;
  const { title, columns, subtitle, phoneLabel, phone } = data;

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
            <span>Звоните: <a style={{ textDecoration: 'none', color: '#333' }} className="comagic_phone" href={`tel:${(phone || siteConfig.phone).replace(/\s/g, '')}`}>{phone || siteConfig.phone}</a></span>
          </p>
        </div>
      </div>
    </div>
  );
}
