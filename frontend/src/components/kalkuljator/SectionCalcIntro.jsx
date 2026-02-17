import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext.jsx';
import { formatPhoneDisplay } from '../../utils/phoneFormat.js';
import { calcIntroData } from '../../data/kalkuljatorData';
import { siteConfig } from '../../data/mockPageData';

function formatPromoDate() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export default function SectionCalcIntro() {
  const { contacts } = useSite();
  const rawPhone = contacts?.phone ?? siteConfig.phone;
  const phone = rawPhone ? formatPhoneDisplay(rawPhone) : (siteConfig.phone || '');
  const data = calcIntroData;
  return (
    <div className="section s_rsto">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            <h1 className="">{data.title}</h1>
            <p className="light">
              {data.description} <span className="comagic_phone">{phone}</span>.
            </p>
            <div className="sk_block">
              <div className="l1">Немецкое полотно<br />по цене российского</div>
              <div className="l2" id="days">До {formatPromoDate()}</div>
              <div className="l3">{data.promoPrice}<span> руб.</span></div>
              <div className="yellow_btn2">
                <Link to={data.promoButtonHref}>{data.promoButtonText}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
