import { useSite } from '../context/SiteContext.jsx';
import { useMenu } from '../context/MenuContext.jsx';
import { formatPhoneDisplay } from '../utils/phoneFormat.js';
import { footerData as defaultFooterData } from '../data/mockPageData';

export default function Footer({ data: dataProp }) {
  const { site, contacts } = useSite();
  const { footerMenu } = useMenu();
  const fromApi = site && contacts && {
    discountText: 'Узнайте больше о скидках компании:',
    phone: contacts.phone ? formatPhoneDisplay(contacts.phone) : '',
    email: contacts.email || '',
    siteUrl: site.domain ? `https://${site.domain}` : '',
    copyright: contacts.company_name || 'Proffi Center',
    legalLink: contacts.legal_link || defaultFooterData.legalLink,
  };
  const data = dataProp ?? fromApi ?? defaultFooterData;
  if (!data) return null;
  const { discountText, phone, email, siteUrl, copyright, copyrightYear, legalLink } = data;

  const openLegal = (e) => {
    e?.preventDefault?.();
    window.open(legalLink, '_blank', 'width=500,height=500');
  };

  return (
    <div className="section s8">
      <div className="container">
        <div className="row">
          <div className="col-md-12 clearfix">
            <div className="footer black center">
              <div className="black d1">
                {discountText} <span className="comagic_phone">{phone}</span>
              </div>
              <div className="black d2">
                <div itemProp="email">{email}</div>
                <link itemProp="url" href={siteUrl} />
              </div>
              <div className="d3">© {copyrightYear != null ? copyrightYear : new Date().getFullYear()} {copyright}</div>
              <div className="d4">
                <a href={legalLink} className="b-link" onClick={openLegal}>Правовая информация</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
